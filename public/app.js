// app.js - Signup form handler
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const usernameValue = document.getElementById('username').value.trim();
        const studentId = document.getElementById('studentid').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const major = document.getElementById('branch').value;
        const gender = document.getElementById('gender').value;
        const age = document.getElementById('age').value;
        const gen = studentId.substring(0, 2); // Always derive from ID

        if (!studentId || !email || !password || !confirmPassword || !major || !gender || !age) {
            showToast('กรุณากรอกฟอร์มให้ครบ', 'error');
            return;
        }

        if (!email.toLowerCase().endsWith('@g.swu.ac.th')) {
            showToast('ต้องใช้อีเมล @g.swu.ac.th เท่านั้นสำหรับการสมัคร', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('รหัสผ่านไม่ตรงกัน', 'error');
            return;
        }

        // เก็บข้อมูลไว้ชั่วคราว
        localStorage.setItem('signupData', JSON.stringify({
            username: usernameValue,
            studentId,
            email,
            password,
            major,
            gender,
            age,
            gen: studentId.substring(0, 2)
        }));

        // redirect ไปหน้า pdpa
        window.location.href = 'pdpa.html';
    });
}

// --- Authentication State & Profile Management ---
document.addEventListener('DOMContentLoaded', () => {
    // Inject Profile Modal to body
    injectProfileModal();

    // Inject Search Modal and Icon
    injectSearchUI();

    // Inject Auth Required Modal
    injectAuthRequiredModal();

    // Initialize Toast Container
    initToastContainer();

    // Initialize Alert Modal
    initAlertModal();

    // Initialize Password Toggles
    initPasswordToggles();

    const userStr = localStorage.getItem('user');
    const signinBtns = document.querySelectorAll('.btn-signin');
    
    // Auto-derive Year/Gen logic
    const studentIdInput = document.getElementById('studentid');
    const genInput = document.getElementById('gen');
    if (studentIdInput && genInput) {
        studentIdInput.addEventListener('input', (e) => {
            if (e.target.value.length >= 2) {
                genInput.value = e.target.value.substring(0, 2);
            }
        });
    }
    if (userStr) {
        // Logged in
        let user = null;
        try {
            user = JSON.parse(userStr);
        } catch (err) {}

        if (user) {
            // Hide .btn-signin elements
            signinBtns.forEach(btn => btn.style.display = 'none');

            // Personalize Navbar Logo
            const logo = document.querySelector('.logo');
            const logoText = document.querySelector('.logo-text');
            if (logo && logoText) {
                // Wrap logo-text and add username
                logo.classList.add('logo-logged-in');
                const wrapper = document.createElement('div');
                wrapper.className = 'logo-text-wrapper';
                
                // Move logoText inside wrapper
                logoText.parentNode.insertBefore(wrapper, logoText);
                wrapper.appendChild(logoText);
                
                // Add username span
                const userDisplay = document.createElement('span');
                userDisplay.className = 'nav-user-name';
                userDisplay.textContent = user.username || user.studentId;
                wrapper.appendChild(userDisplay);
            }

            // Populate profile data if on profile page
            if (window.location.pathname.includes('profile.html')) {
                const dUsername = document.getElementById('displayUsername');
                const dMajor = document.getElementById('displayMajor');
                const dBio = document.getElementById('displayBio');
                const dSkills = document.getElementById('displaySkills');
                const dAvatar = document.getElementById('displayAvatar');
                const dAge = document.getElementById('displayAge');
                
                // Use generation from API (derived by backend) or fallback to ID
                const derivedGen = user.generation || (user.student_id ? user.student_id.substring(0, 2) : '-');
                
                const dEmail = document.getElementById('displayEmail');
                const dGender = document.getElementById('displayGender');
                const dGen = document.getElementById('displayGen');

                if (dUsername) dUsername.textContent = user.username || 'Admin';
                if (dGen) dGen.textContent = derivedGen;
                if (dMajor) {
                    const majorMapping = {
                        'cs': 'COMPUTER SCIENCE<br>วิทยาการคอมพิวเตอร์',
                        'math': 'MATH-STAT<br>คณิตศาสตร์-สถิติ',
                        'bio': 'BIOLOGY<br>ชีววิทยา',
                        'chem': 'CHEMISTRY<br>เคมี',
                        'gen': 'GENERAL SCIENCE<br>วิทยาศาสตร์ทั่วไป',
                        'mat': 'MATERIAL SCIENCE<br>วัสดุศาสตร์',
                        'micro': 'MICROBIOLOGY<br>จุลชีววิทยา',
                        'phy': 'PHYSICS<br>ฟิสิกส์'
                    };
                    const abbrev = (user.major || '').toLowerCase();
                    dMajor.textContent = majorMapping[abbrev] || abbrev.toUpperCase();
                }
                if (dEmail) dEmail.textContent = user.email || '';
                if (dGender) dGender.textContent = user.gender || '-';
                if (dAge) dAge.textContent = user.age || '-';
                if (dBio && user.bio) dBio.textContent = user.bio;
                
                if (dSkills && user.skills) {
                    let skillsArr = [];
                    try {
                        skillsArr = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
                    } catch(e) {}
                    
                    if (Array.isArray(skillsArr) && skillsArr.length > 0) {
                        dSkills.innerHTML = '';
                        skillsArr.forEach(skill => {
                            const span = document.createElement('span');
                            span.className = 'tag';
                            span.textContent = skill;
                            dSkills.appendChild(span);
                        });
                    }
                }
                
                if (dAvatar) {
                    if (user.photo && user.photo !== 'default.png') {
                         dAvatar.src = user.photo;
                    } else {
                         dAvatar.src = `https://ui-avatars.com/api/?name=${user.username || 'A'}&background=random`;
                    }
                }

                // Render social links
                const dSocialBox = document.getElementById('displaySocialBox');
                const dSocialLinksContainer = document.getElementById('socialLinksContainer');

                if (dSocialBox && dSocialLinksContainer) {
                    let hasSocial = false;
                    let socialHTML = '';

                    if (user.facebook_url && user.facebook_url.trim() !== '') {
                        hasSocial = true;
                        socialHTML += `
                            <a href="${user.facebook_url}" target="_blank" class="social-btn fb">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                Facebook
                            </a>`;
                    }
                    if (user.instagram_url && user.instagram_url.trim() !== '') {
                        hasSocial = true;
                        socialHTML += `
                            <a href="${user.instagram_url}" target="_blank" class="social-btn ig">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                Instagram
                            </a>`;
                    }
                    if (user.line_url && user.line_url.trim() !== '') {
                        hasSocial = true;
                        let lineHref = user.line_url;
                        if (!lineHref.startsWith('http') && !lineHref.startsWith('https')) {
                            // If it's potentially an ID, link to line.me. Could also just leave it as text. 
                            // Using line://ti/p/~ or https://line.me/ti/p/~ as default if no http is present
                            lineHref = `https://line.me/ti/p/~${lineHref}`;
                        }
                        socialHTML += `
                            <a href="${lineHref}" target="_blank" class="social-btn line">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                Line
                            </a>`;
                    }

                    if (hasSocial) {
                        dSocialLinksContainer.innerHTML = socialHTML;
                        dSocialBox.style.display = 'block';
                    } else {
                        dSocialBox.style.display = 'none';
                    }
                }

                // Apply dynamic theme color based on major
                const profileCard = document.getElementById('profileCard');
                const dStudentId = document.getElementById('displayStudentId');
                const privateBox = document.getElementById('privateIdBox');

                if (profileCard && user.major) {
                    // Remove existing themes
                    profileCard.classList.remove('branch-cs-bg', 'branch-math-bg', 'branch-bio-bg', 'branch-chem-bg', 'branch-gen-bg', 'branch-mat-bg', 'branch-micro-bg', 'branch-phy-bg');
                    profileCard.className = `profile-card themed theme-${user.major}`;
                    
                    if (dAvatar) dAvatar.className = `profile-avatar themed border-${user.major}`;
                    if (dMajor) dMajor.className = `profile-branch-name themed text-${user.major}`;
                }

                // Show Student ID only if owner (on private profile page)
                if (dStudentId && privateBox && window.location.pathname.includes('profile.html')) {
                    dStudentId.textContent = user.student_id || user.username;
                    privateBox.style.display = 'block';
                }
            }
        }
    } else {
        // Not logged in. If on profile.html, redirect
        if (window.location.pathname.includes('profile.html')) {
            showAuthRequiredModal();
            // Optional: Redirect after a delay or on modal close
        }
    }

    // Check for URL parameters to auto-trigger search (for redirects from other pages)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('keyword') || urlParams.has('major') || urlParams.has('gender') || urlParams.has('gen') || urlParams.has('age')) {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            // Wait a bit for other initialization or trigger immediately
            setTimeout(() => performSearch(true), 100);
        }
    }

    // Logout handling
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            
            // Show login buttons again and go to home
            signinBtns.forEach(btn => btn.style.display = '');
            window.location.href = 'home.html';
        });
    }

    // --- Profile.html Specifics ---
    if (window.location.pathname.includes('profile.html') && userStr) {
        let user = null;
        try { user = JSON.parse(userStr); } catch (e) {}
        
        const visibilityToggle = document.getElementById('profileVisibilityStandalone');
        if (visibilityToggle && user) {
            visibilityToggle.checked = user.visible !== false;
            visibilityToggle.addEventListener('change', async (e) => {
                if (!user.id) {
                    showToast('บัญชีพิเศษไม่สามารถตั้งค่าได้', 'info');
                    e.target.checked = !e.target.checked;
                    return;
                }
                
                try {
                    const visRes = await fetch(`http://localhost:3000/api/users/${user.id}/visibility`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ visible: e.target.checked })
                    });
                    
                    if (!visRes.ok) throw new Error('Failed to update visibility');
                    const updated = await visRes.json();
                    
                    user.visible = updated.user.visible;
                    localStorage.setItem('user', JSON.stringify(user));
                    showToast('อัปเดตสถานะการมองเห็นสำเร็จ');
                } catch (err) {
                    showToast('เกิดข้อผิดพลาดในการตั้งค่า: ' + err.message, 'error');
                    e.target.checked = !e.target.checked;
                }
            });
        }
    }

    // --- Edit_Profile.html Specifics ---
    if (window.location.pathname.includes('edit_profile.html') && userStr) {
        let user = null;
        try { user = JSON.parse(userStr); } catch (e) {}
        
        const editFormPage = document.getElementById('editProfileFormPage');
        if (editFormPage && user) {
            if (!user.id) {
                showToast('บัญชีพิเศษไม่สามารถแก้ไขได้', 'info');
                window.location.href = 'profile.html';
                return;
            }
            
            // Pre-fill form (Generation is auto-derived from username)
            document.getElementById('display-name').value = user.username || '';
            document.getElementById('branch').value = user.major || 'cs';
            document.getElementById('gender').value = user.gender || 'ชาย';
            document.getElementById('age').value = user.age || '';
            document.getElementById('bio').value = user.bio || '';
            
            // Prefill new social fields
            const fbid = document.getElementById('facebook_url');
            if (fbid) fbid.value = user.facebook_url || '';
            const igid = document.getElementById('instagram_url');
            if (igid) igid.value = user.instagram_url || '';
            const lineid = document.getElementById('line_url');
            if (lineid) lineid.value = user.line_url || '';
            
            let skillsStr = '';
            try {
                const parsed = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
                if (Array.isArray(parsed)) skillsStr = parsed.join(', ');
            } catch(e) {}
            document.getElementById('skills').value = skillsStr;
            
            editFormPage.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const displayName = document.getElementById('display-name').value.trim();
                const studentId = user.student_id; 
                const age = document.getElementById('age').value;
                const major = document.getElementById('branch').value;
                const gender = document.getElementById('gender').value;
                const bio = document.getElementById('bio').value.trim();
                const skillsInput = document.getElementById('skills').value;
                const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(s => s);
                
                const facebook_url = document.getElementById('facebook_url') ? document.getElementById('facebook_url').value.trim() : '';
                const instagram_url = document.getElementById('instagram_url') ? document.getElementById('instagram_url').value.trim() : '';
                const line_url = document.getElementById('line_url') ? document.getElementById('line_url').value.trim() : '';
                
                const fileInput = document.getElementById('editAvatarInput');
                let photoBase64 = user.photo;
                
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    photoBase64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 500;
                                const MAX_HEIGHT = 500;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                    if (width > MAX_WIDTH) {
                                        height *= MAX_WIDTH / width;
                                        width = MAX_WIDTH;
                                    }
                                } else {
                                    if (height > MAX_HEIGHT) {
                                        width *= MAX_HEIGHT / height;
                                        height = MAX_HEIGHT;
                                    }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, width, height);
                                resolve(canvas.toDataURL('image/jpeg', 0.8));
                            };
                            img.onerror = reject;
                            img.src = ev.target.result;
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                }
                
                try {
                    const saveBtn = editFormPage.querySelector('.btn-save');
                    if (saveBtn) { saveBtn.textContent = 'กำลังบันทึก...'; saveBtn.disabled = true; }
                    
                    const updateData = {
                        username: displayName,
                        student_id: studentId,
                        age,
                        major,
                        bio,
                        skills: JSON.stringify(skillsArray),
                        photo: photoBase64,
                        email: user.email,
                        password: user.password,
                        gender: gender,
                        facebook_url,
                        instagram_url,
                        line_url
                    };
                    
                    const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });
                    
                    const data = await res.json();
                    if (res.ok) {
                        // Combine and save
                        const finalUser = { ...data.user, visible: user.visible };
                        localStorage.setItem('user', JSON.stringify(finalUser));
                        
                        showToast('อัปเดตข้อมูลสำเร็จ!', 'success');
                        setTimeout(() => window.location.href = 'profile.html', 2000);
                    } else {
                        showToast('เกิดข้อผิดพลาด: ' + (data.message || 'Unknown error'), 'error');
                        const saveBtn = editFormPage.querySelector('.btn-save');
                        if (saveBtn) { saveBtn.textContent = 'บันทึกข้อมูลโพรไฟล์ (Save)'; saveBtn.disabled = false; }
                    }
                } catch (err) {
                    console.error(err);
                    showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
                    const saveBtn = editFormPage.querySelector('.btn-save');
                    if (saveBtn) { saveBtn.textContent = 'บันทึกข้อมูลโพรไฟล์ (Save)'; saveBtn.disabled = false; }
                }
            });
        }
    }

    // The main search logic is now moved to performSearch function
    // used by the search modal injected via injectSearchUI().

    // Major Page Dynamic Loading
    const membersGrid = document.querySelector('.members-grid');
    const isMajorPage = !window.location.pathname.includes('home.html') && 
                       !window.location.pathname.includes('profile.html') && 
                       !window.location.pathname.includes('major.html') &&
                       !window.location.pathname.includes('pdpa.html') &&
                       !window.location.pathname.includes('signin.html') &&
                       !window.location.pathname.includes('signup.html');

    if (membersGrid && isMajorPage) {
        const path = window.location.pathname.toLowerCase();
        let major = '';
        if (path.includes('comsci')) major = 'cs';
        else if (path.includes('mathstat')) major = 'math';
        else if (path.includes('bio')) major = 'bio';
        else if (path.includes('chem')) major = 'chem';
        else if (path.includes('gensci')) major = 'gen';
        else if (path.includes('matsci')) major = 'mat';
        else if (path.includes('micro')) major = 'micro';
        else if (path.includes('physics')) major = 'phy';

        // Log for debugging
        console.log('Detected major:', major, 'from path:', path);

        if (major) {
            membersGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b; font-size: 1.2rem;"><svg class="sci-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"></ellipse></svg> กำลังดึงข้อมูลเพื่อนๆ สาขา ' + major.toUpperCase() + '...</div>';
            loadMajorStudents(major, membersGrid);
        }

        // --- Dynamic Gen Filter Upgrade ---
        const genFilter = document.querySelector('.gen-filter');
        if (genFilter) {
            genFilter.innerHTML = `
                <button class="gen-btn active" id="btnGenAll">ทั้งหมด (All)</button>
                <div class="gen-input-wrapper">
                    <span style="font-size: 0.9rem; color: #64748b; font-weight: 500;">รุ่น:</span>
                    <input type="text" class="gen-type-input" id="inputGenValue" placeholder="ระบุเลขรุ่น...">
                    <button class="btn-gen-confirm" id="btnGenConfirm">ตกลง</button>
                </div>
            `;

            const btnAll = document.getElementById('btnGenAll');
            const inputGen = document.getElementById('inputGenValue');
            const btnConfirm = document.getElementById('btnGenConfirm');

            const executeFilter = () => {
                const val = inputGen.value.trim();
                if (val) {
                    btnAll.classList.remove('active');
                } else {
                    btnAll.classList.add('active');
                }
                filterGridByGen(membersGrid, val);
            };

            btnAll.addEventListener('click', () => {
                inputGen.value = '';
                btnAll.classList.add('active');
                filterGridByGen(membersGrid, null);
            });

            // Prevent non-numeric input
            inputGen.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });

            // Handle confirmation
            btnConfirm.addEventListener('click', executeFilter);
            inputGen.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') executeFilter();
            });
        }
    }

    // Global Authentication Guard for Major/Branch pages
    document.addEventListener('click', (e) => {
        const userStr = localStorage.getItem('user');
        if (userStr) return; // User is logged in, allow all

        // 1. Check for Major/Connect links
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href') || '';
            if (href.includes('major.html') || href.includes('profile.html')) {
                e.preventDefault();
                showAuthRequiredModal();
                return;
            }
        }

        // 2. Check for Branch Cards (Home page)
        const branchCard = e.target.closest('.branch-card');
        if (branchCard) {
            e.preventDefault();
            showAuthRequiredModal();
        }
    });

    // Rename 'Major' link to 'Connect' if on relevant pages
    const majorLink = Array.from(document.querySelectorAll('.nav-links a')).find(a => a.getAttribute('href') === 'major.html');
    if (majorLink) {
        const path = window.location.pathname.toLowerCase();
        const isConnectPage = path.includes('major.html') || 
                             path.includes('comsci.html') || 
                             path.includes('mathstat.html') || 
                             path.includes('bio.html') || 
                             path.includes('chem.html') || 
                             path.includes('gensci.html') || 
                             path.includes('matsci.html') || 
                             path.includes('micro.html') || 
                             path.includes('physics.html');
        
        if (isConnectPage) {
            majorLink.textContent = 'Connect';
            majorLink.classList.add('active'); // Ensure it stays active
        }
    }
});


function filterGridByGen(grid, gen) {
    const cards = grid.querySelectorAll('.member-card');
    cards.forEach(card => {
        if (!gen) {
            card.style.display = 'flex';
        } else {
            const badge = card.querySelector('.member-badge');
            if (badge && badge.textContent.includes(`รุ่น ${gen}`)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

function injectProfileModal() {
    if (document.getElementById('profileModalBackdrop')) return;

    const modalHTML = `
        <div id="profileModalBackdrop" class="modal-backdrop">
            <div class="profile-modal">
                <div class="modal-close" onclick="closeProfileModal()">&times;</div>
                <div id="modalContent" class="modal-body">
                    <!-- Dynamic Content -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on backdrop click
    document.getElementById('profileModalBackdrop').addEventListener('click', (e) => {
        if (e.target.id === 'profileModalBackdrop') closeProfileModal();
    });
}

function openProfileModal(user) {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        showAuthRequiredModal();
        return;
    }
    const backdrop = document.getElementById('profileModalBackdrop');
    const content = document.getElementById('modalContent');
    if (!backdrop || !content) return;

    let skills = [];
    try {
        if (user.skills) {
            skills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
            if (!Array.isArray(skills)) skills = [];
        }
    } catch(e) {
        console.warn('Failed to parse skills:', e);
    }

    const avatar = user.photo && user.photo !== 'default.png' ? user.photo : `https://ui-avatars.com/api/?name=${user.username}&background=random`;
    const derivedGen = user.generation || (user.student_id ? user.student_id.substring(0, 2) : '-');

    let socialHTMLStr = '';
    
    if (user.facebook_url && user.facebook_url.trim() !== '') {
        socialHTMLStr += `
            <a href="${user.facebook_url}" target="_blank" title="Facebook" style="color: #1877F2; text-decoration: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>`;
    }
    if (user.instagram_url && user.instagram_url.trim() !== '') {
        socialHTMLStr += `
            <a href="${user.instagram_url}" target="_blank" title="Instagram" style="color: #E1306C; text-decoration: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>`;
    }
    if (user.line_url && user.line_url.trim() !== '') {
        let lineHref = user.line_url;
        if (!lineHref.startsWith('http') && !lineHref.startsWith('https')) {
            lineHref = `https://line.me/ti/p/~${lineHref}`;
        }
        socialHTMLStr += `
            <a href="${lineHref}" target="_blank" title="Line" style="color: #00C300; text-decoration: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .26-.156.514-.438.586-.06.014-.114.024-.166.024-.205 0-.401-.096-.527-.264l-1.567-2.183v2.091c0 .344-.282.629-.629.629-.345 0-.628-.285-.628-.629V8.108c0-.264.156-.516.44-.588.058-.012.115-.022.169-.022.203 0 .399.098.525.266l1.565 2.181V7.854c0-.345.283-.63.63-.63.344 0 .629.285.629.63v4.469zm-5.074-3.647h-1.55v3.018c0 .344-.28.629-.628.629-.346 0-.629-.285-.629-.629V8.108c0-.345.283-.63.629-.63h2.178c.346 0 .629.285.629.63 0 .349-.283.63-.629.63m-4.321 4.276H5.485c-.344 0-.628-.285-.628-.629V8.108c0-.345.284-.63.628-.63.348 0 .63.285.63.63v3.754h.631c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.295.079.756.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.967C23.189 14.507 24 12.49 24 10.314"/></svg>
            </a>`;
    }

    content.innerHTML = `
        <img src="${avatar}" alt="Avatar" class="modal-avatar">
        <h3 class="modal-name">${user.username}</h3>
        <div class="modal-meta">รุ่น ${derivedGen} | อายุ ${user.age || '-'} | ${user.gender} | ${(user.major || '').toUpperCase()}</div>
        <p class="modal-bio">${user.bio || 'ไม่มีรายละเอียดแนะนำตัว'}</p>
        
        ${socialHTMLStr ? `
        <div class="modal-social" style="display: flex; gap: 1rem; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
            ${socialHTMLStr}
        </div>
        ` : ''}

        <div class="modal-skills-title">ความสามารถ (Skills)</div>
        <div class="modal-skills">
            ${(skills || []).length > 0 
                ? skills.map(s => `<span class="modal-skill-tag">${s}</span>`).join('')
                : '<span style="color: #94a3b8; font-style: italic;">ไม่มีข้อมูลสกิล</span>'}
        </div>
    `;

    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeProfileModal() {
    const backdrop = document.getElementById('profileModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

async function loadMajorStudents(major, container) {
    try {
        const res = await fetch(`http://localhost:3000/api/users/search?major=${major}`);
        const users = await res.json();
        
        container.innerHTML = ''; // Clear hardcoded
        if (users.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748b;">ยังไม่มีนิสิตในสาขานี้ที่เปิดเผยโปรไฟล์</div>';
        } else {
            users.forEach(u => container.appendChild(createStudentCard(u)));
        }
    } catch (err) {
        console.error('Failed to load major students:', err);
    }
}

function createStudentCard(user) {
    const card = document.createElement('a');
    card.href = 'javascript:void(0)'; 
    card.onclick = () => openProfileModal(user);
    card.className = `member-card branch-${user.major}-bg`;
    card.style.textDecoration = 'none';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.padding = '1.5rem';
    card.style.gap = '0.5rem';

    const avatarName = encodeURIComponent(user.username || 'U');
    const avatar = user.photo && user.photo !== 'default.png' ? user.photo : `https://ui-avatars.com/api/?name=${avatarName}&background=random&color=fff&size=128`;
    
    // Derivation logic: prioritize generation from API, then student_id
    const derivedGen = user.generation || (user.student_id ? user.student_id.substring(0, 2) : '-');
    
    let skills = [];
    try {
        skills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
    } catch(e) {}

    card.innerHTML = `
        <img src="${avatar}" alt="Avatar" class="member-avatar" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid white;">
        <span class="member-name" style="font-weight: 700; color: #1e293b;">${user.username}</span>
        <span class="member-badge" style="font-size: 0.8rem; background: rgba(255,255,255,0.5); padding: 0.2rem 0.6rem; border-radius: 20px;">รุ่น ${derivedGen} | ${user.gender}</span>
        <p style="font-size: 0.85rem; color: #475569; margin-top: 0.5rem; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${user.bio || 'ไม่มีรายละเอียดแนะนำตัว'}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-top: 0.5rem;">
            ${(skills || []).slice(0, 3).map(s => `<span style="font-size: 0.7rem; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">${s}</span>`).join('')}
        </div>
    `;
    return card;
}

function injectSearchUI() {
    if (document.getElementById('searchModalBackdrop')) return;

    // 1. Inject Magnifying Glass Icon to Navbar (as the last link in nav-links)
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const li = document.createElement('li');
        const searchBtn = document.createElement('button');
        searchBtn.className = 'nav-search-btn';
        searchBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        `;
        searchBtn.title = 'ค้นหานิสิต';
        searchBtn.onclick = toggleSearchModal;
        li.appendChild(searchBtn);
        navLinks.appendChild(li);
    }

    // 2. Inject Search Modal to Body
    const modalHTML = `
        <div id="searchModalBackdrop" class="search-modal-backdrop">
            <div class="search-modal">
                <div class="search-modal-close" onclick="closeSearchModal()">&times;</div>
                <div class="search-modal-header">
                    <h2>ค้นหานิสิต (Search)</h2>
                </div>
                <div class="search-modal-grid">
                    <div class="search-modal-group full">
                        <label>ค้นหา (Keyword)</label>
                        <input type="text" id="mSearchKeyword" class="search-modal-input" placeholder="ชื่อ หรือ Bio...">
                    </div>
                    <div class="search-modal-group">
                        <label>สาขา (Major)</label>
                        <select id="mSearchMajor" class="search-modal-input">
                            <option value="">ทั้งหมด</option>
                            <option value="cs">Com-Sci</option>
                            <option value="math">Math-Stat</option>
                            <option value="bio">Biology</option>
                            <option value="chem">Chemistry</option>
                            <option value="gen">Gen-Sci</option>
                            <option value="mat">Mat-Sci</option>
                            <option value="micro">Micro-Bio</option>
                            <option value="phy">Physics</option>
                        </select>
                    </div>
                    <div class="search-modal-group">
                        <label>เพศ (Gender)</label>
                        <select id="mSearchGender" class="search-modal-input">
                            <option value="">ทั้งหมด</option>
                            <option value="ชาย">ชาย</option>
                            <option value="หญิง">หญิง</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>
                    <div class="search-modal-group">
                        <label>รุ่น (Gen)</label>
                        <input type="text" id="mSearchGen" class="search-modal-input" placeholder="เช่น 68">
                    </div>
                    <div class="search-modal-group">
                        <label>อายุ (Age)</label>
                        <input type="number" id="mSearchAge" class="search-modal-input" placeholder="ระบุอายุ">
                    </div>
                    <button class="search-modal-btn" onclick="performSearch()">ค้นหา (Search Now)</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on backdrop click
    document.getElementById('searchModalBackdrop').addEventListener('click', (e) => {
        if (e.target.id === 'searchModalBackdrop') closeSearchModal();
    });
}

function toggleSearchModal() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        showAuthRequiredModal();
        return;
    }
    const backdrop = document.getElementById('searchModalBackdrop');
    if (backdrop) {
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSearchModal() {
    const backdrop = document.getElementById('searchModalBackdrop');
    if (backdrop) {
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function injectAuthRequiredModal() {
    if (document.getElementById('authRequiredModalBackdrop')) return;
    const modalHTML = `
        <div id="authRequiredModalBackdrop" class="auth-modal-backdrop">
            <div class="auth-modal">
                <div class="auth-modal-icon-wrapper">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h3 style="font-weight: 700; font-size: 1.75rem; margin-bottom: 0.5rem;">ต้องเข้าสู่ระบบก่อน</h3>
                <p style="font-size: 1rem; color: #64748b; margin-bottom: 2rem;">กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานฟีเจอร์ค้นหาและดูโปรไฟล์ของเพื่อนๆ ครับ</p>
                <div class="auth-modal-btns">
                    <a href="signin.html" class="btn-auth-signin">เข้าสู่ระบบตอนนี้</a>
                    <button class="btn-auth-close" onclick="closeAuthRequiredModal()">ไว้ทีหลัง</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on backdrop click
    const backdrop = document.getElementById('authRequiredModalBackdrop');
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target.id === 'authRequiredModalBackdrop') closeAuthRequiredModal();
        });
    }
}

function showAuthRequiredModal() {
    const backdrop = document.getElementById('authRequiredModalBackdrop');
    if (backdrop) {
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthRequiredModal() {
    const backdrop = document.getElementById('authRequiredModalBackdrop');
    if (backdrop) {
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function performSearch(fromUrl = false) {
    let keyword, major, gender, gen, age;

    if (fromUrl) {
        const params = new URLSearchParams(window.location.search);
        keyword = params.get('keyword') || '';
        major = params.get('major') || '';
        gender = params.get('gender') || '';
        gen = params.get('gen') || '';
        age = params.get('age') || '';
        
        // Optionally pre-fill modal inputs
        if (document.getElementById('mSearchKeyword')) {
            document.getElementById('mSearchKeyword').value = keyword;
            document.getElementById('mSearchMajor').value = major;
            document.getElementById('mSearchGender').value = gender;
            document.getElementById('mSearchGen').value = gen;
            document.getElementById('mSearchAge').value = age;
        }
    } else {
        keyword = document.getElementById('mSearchKeyword').value.trim();
        major = document.getElementById('mSearchMajor').value;
        gender = document.getElementById('mSearchGender').value;
        gen = document.getElementById('mSearchGen').value.trim();
        age = document.getElementById('mSearchAge').value.trim();
    }

    const searchResults = document.getElementById('searchResults');
    const branchesSection = document.querySelector('.branches-section');

    // If we are on a page WITHOUT search results (e.g. About), redirect to major.html
    if (!searchResults && !fromUrl) {
        const query = new URLSearchParams({ keyword, major, gender, gen, age }).toString();
        window.location.href = `major.html?${query}`;
        return;
    }

    if (searchResults) {
        // Close modal if searching from modal
        if (!fromUrl) closeSearchModal();

        searchResults.style.display = 'grid';
        searchResults.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748b;"><svg class="sci-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"></ellipse></svg> กำลังดำเนินการค้นหา...</div>';
        
        // Scroll to results
        searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });

        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            if (major) params.append('major', major);
            if (gender) params.append('gender', gender);
            if (gen) params.append('gen', gen);
            if (age) params.append('age', age);

            const res = await fetch(`http://localhost:3000/api/users/search?${params.toString()}`);
            const users = await res.json();

            searchResults.innerHTML = '';
            if (users.length === 0) {
                searchResults.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748b;">ไม่พบข้อมูลนิสิตที่ค้นหา</div>';
            } else {
                users.forEach(u => searchResults.appendChild(createStudentCard(u)));
            }
            
            const isSearching = !!(keyword || major || gender || gen || age);
            if (branchesSection) branchesSection.style.display = isSearching ? 'none' : 'block';

            // Clean up URL if we came from a redirect
            if (fromUrl) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (err) {
            console.error('Search failed:', err);
            searchResults.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #ef4444;">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>';
        }
    }
}

/* --- Toast System --- */
function initToastContainer() {
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info', duration = 3000) {
    initToastContainer();
    const container = document.querySelector('.toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '✨';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

/* --- Alert Modal (Popup) System --- */
function initAlertModal() {
    if (!document.getElementById('alertModalBackdrop')) {
        const modalHTML = `
            <div id="alertModalBackdrop" class="alert-modal-backdrop">
                <div class="alert-modal">
                    <span id="alertIcon" class="alert-icon"></span>
                    <h3 id="alertTitle" class="alert-title"></h3>
                    <p id="alertMessage" class="alert-message"></p>
                    <button id="alertBtn" class="alert-btn">ตกลง</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

/**
 * Show a centered Popup alert
 */
function showAlert(message, type = 'info', title = 'แจ้งเตือน') {
    initAlertModal();
    const backdrop = document.getElementById('alertModalBackdrop');
    const iconEl = document.getElementById('alertIcon');
    const titleEl = document.getElementById('alertTitle');
    const msgEl = document.getElementById('alertMessage');
    const btn = document.getElementById('alertBtn');

    titleEl.textContent = title;
    msgEl.textContent = message;

    btn.className = 'alert-btn';
    let icon = '✨';
    if (type === 'success') {
        icon = '✅';
        btn.classList.add('alert-btn-success');
    } else if (type === 'error') {
        icon = '❌';
        btn.classList.add('alert-btn-error');
    } else {
        icon = 'ℹ️';
    }
    iconEl.textContent = icon;

    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    return new Promise((resolve) => {
        btn.onclick = () => {
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
            resolve();
        };
    });
}

/* --- Password Toggle System --- */
function initPasswordToggles() {
    const toggles = document.querySelectorAll('.password-toggle');
    toggles.forEach(toggle => {
        if (toggle.dataset.initialized) return;
        const targetId = toggle.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
            toggle.onclick = (e) => {
                e.preventDefault();
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                
                // If it was dots (password), it's now text -> show OPEN eye
                // If it was text, it's now dots (password) -> show CLOSED eye
                toggle.innerHTML = isPassword 
                    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>` // Eye (open)
                    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`; // Eye-off (closed)
            };
            toggle.dataset.initialized = 'true';
        }
    });
}

