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

        const age = document.getElementById('age').value;
        const gen = studentId.substring(0, 2); // Always derive from ID

        if (!studentId || !email || !password || !confirmPassword || !major || !gender || !age) {
            alert('กรุณากรอกฟอร์มให้ครบ');
            return;
        }

        if (!email.toLowerCase().endsWith('@g.swu.ac.th')) {
            alert('ต้องใช้อีเมล @g.swu.ac.th เท่านั้นสำหรับการสมัคร');
            return;
        }

        if (password !== confirmPassword) {
            alert('รหัสผ่านไม่ตรงกัน');
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
    
    // Inject 'Connect' to navbar
    injectConnectLink();

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
                if (dMajor) dMajor.textContent = (user.major || '').toUpperCase();
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
            alert('กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์');
            window.location.href = 'signin.html';
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
                    alert('บัญชีพิเศษไม่สามารถตั้งค่าได้');
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
                } catch (err) {
                    alert('เกิดข้อผิดพลาดในการตั้งค่า: ' + err.message);
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
                alert('บัญชีพิเศษไม่สามารถแก้ไขได้');
                window.location.href = 'profile.html';
                return;
            }
            
            // Pre-fill form (Generation is auto-derived from username)
            document.getElementById('display-name').value = user.username || '';
            document.getElementById('branch').value = user.major || 'cs';
            document.getElementById('gender').value = user.gender || 'ชาย';
            document.getElementById('age').value = user.age || '';
            document.getElementById('bio').value = user.bio || '';
            
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
                        gender: gender
                    };
                    
                    const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });
                    
                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.message || 'ไม่สามารถบันทึกข้อมูลได้');
                    }
                    
                    const updatedData = await res.json();
                    
                    // Combine and save
                    const finalUser = { ...updatedData.user, visible: user.visible };
                    localStorage.setItem('user', JSON.stringify(finalUser));
                    
                    alert('อัปเดตข้อมูลสำเร็จ!');
                    window.location.href = 'profile.html';
                } catch (err) {
                    alert('เกิดข้อผิดพลาด: ' + err.message);
                    const saveBtn = editFormPage.querySelector('.btn-save');
                    if (saveBtn) { saveBtn.textContent = 'บันทึกข้อมูลโพรไฟล์ (Save)'; saveBtn.disabled = false; }
                }
            });
        }
    }

    // --- Search & Student Listing Logic ---
    const btnSearch = document.getElementById('btnSearch');
    if (btnSearch) {
        btnSearch.addEventListener('click', async () => {
            const keyword = document.getElementById('searchKeyword').value.trim();
            const major = document.getElementById('searchMajor').value;
            const gender = document.getElementById('searchGender').value;
            const gen = document.getElementById('searchGen').value.trim();
            const age = document.getElementById('searchAge').value.trim();

            const searchResults = document.getElementById('searchResults');
            const branchesSection = document.querySelector('.branches-section');

            try {
                const params = new URLSearchParams();
                if (keyword) params.append('keyword', keyword);
                if (major) params.append('major', major);
                if (gender) params.append('gender', gender);
                if (gen) params.append('gen', gen);
                if (age) params.append('age', age);

                const res = await fetch(`http://localhost:3000/api/users/search?${params.toString()}`);
                const users = await res.json();

                if (searchResults) {
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'grid';
                    
                    if (users.length === 0) {
                        searchResults.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748b;">ไม่พบข้อมูลนิสิตที่ค้นหา</div>';
                    } else {
                        users.forEach(u => searchResults.appendChild(createStudentCard(u)));
                    }
                    
                    // Hide branches if searching
                    if (branchesSection) branchesSection.style.display = (keyword || major || gender || age) ? 'none' : 'block';
                }
            } catch (err) {
                console.error('Search failed:', err);
            }
        });
    }

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
            membersGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b; font-size: 1.2rem;">⚛️ กำลังดึงข้อมูลเพื่อนๆ สาขา ' + major.toUpperCase() + '...</div>';
            loadMajorStudents(major, membersGrid);
        }

        // Gen filtering logic
        const genBtns = document.querySelectorAll('.gen-btn');
        genBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                genBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const selectedGenText = btn.textContent.trim();
                const genValue = selectedGenText.includes('ทั้งหมด') ? null : selectedGenText.replace('รุ่น ', '').trim();
                
                filterGridByGen(membersGrid, genValue);
            });
        });
    }
});

function injectConnectLink() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !navLinks.querySelector('.link-connect')) {
        const li = document.createElement('li');
        const isActive = window.location.pathname.includes('major.html') || 
                        (!window.location.pathname.includes('home.html') && 
                         !window.location.pathname.includes('profile.html') && 
                         !window.location.pathname.includes('about.html'));
        
        li.innerHTML = `<a href="major.html" class="${isActive ? 'connect-active' : ''} link-connect">Connect</a>`;
        // Insert after Home (index 0) or at the end
        if (navLinks.children.length > 1) {
            navLinks.insertBefore(li, navLinks.children[1]);
        } else {
            navLinks.appendChild(li);
        }
    }
}

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

    content.innerHTML = `
        <img src="${avatar}" alt="Avatar" class="modal-avatar">
        <h3 class="modal-name">${user.username}</h3>
        <div class="modal-meta">รุ่น ${derivedGen} | อายุ ${user.age || '-'} | ${user.gender} | ${(user.major || '').toUpperCase()}</div>
        <p class="modal-bio">${user.bio || 'ไม่มีรายละเอียดแนะนำตัว'}</p>
        <div class="modal-skills-title">ความสามารถ (Skills)</div>
        <div class="modal-skills">
            ${(skills || []).length > 0 
                ? skills.map(s => `<span class="modal-skill-tag">${s}</span>`).join('')
                : '<span style="color: #94a3b8; font-style: italic;">ไม่มีข้อมูลสกิล</span>'}
        </div>
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
             <a href="mailto:${user.email}" style="padding: 0.6rem 1.2rem; background: #e2e8f0; border-radius: 8px; color: #1e293b; font-weight: 600; font-size: 0.85rem;">Email Me</a>
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
        <p style="font-size: 0.85rem; color: #475569; margin-top: 0.5rem; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${user.bio || 'สายวิทย์หน้าตาดี...'}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-top: 0.5rem;">
            ${(skills || []).slice(0, 3).map(s => `<span style="font-size: 0.7rem; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">${s}</span>`).join('')}
        </div>
    `;
    return card;
}