// public/app.js
document.addEventListener('DOMContentLoaded', () => {
    // 0. Auth Required Modal Logic (Run early to intercept clicks)
    const injectAuthModal = () => {
        // ... modal HTML injection logic ...
        const modalId = 'authModalOverlay';
        if (document.getElementById(modalId)) return; // Prevent double injection

        const modalHTML = `
            <div id="${modalId}" class="auth-modal-overlay">
                <div class="auth-modal">
                    <div class="auth-modal-icon">🔒</div>
                    <h2>เข้าสู่ระบบเพื่อใช้งาน</h2>
                    <p>กรุณาเข้าสู่ระบบก่อนเพื่อดูโปรไฟล์เพื่อนๆ และจัดการข้อมูลส่วนตัวของคุณ</p>
                    <div class="auth-modal-actions">
                        <a href="signin.html" class="btn-modal-signin">ไปหน้าเข้าสู่ระบบ</a>
                        <button id="closeAuthModal" class="btn-modal-close">ไว้ทีหลัง</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const overlay = document.getElementById(modalId);
        const closeBtn = document.getElementById('closeAuthModal');

        const showModal = () => {
            overlay.style.display = 'flex';
            setTimeout(() => overlay.classList.add('show'), 10);
            document.body.style.overflow = 'hidden'; 
        };

        const hideModal = () => {
            overlay.classList.remove('show');
            document.body.style.overflow = ''; 
            setTimeout(() => {
                if (!overlay.classList.contains('show')) {
                    overlay.style.display = 'none';
                }
            }, 800); 
        };

        if(closeBtn) closeBtn.addEventListener('click', hideModal);
        if(overlay) overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideModal();
        });

        document.addEventListener('click', (e) => {
            const profileLink = e.target.closest('a[href="profile.html"]');
            if (profileLink && !JSON.parse(localStorage.getItem('currentUser'))) {
                e.preventDefault();
                showModal();
            }
        });
    };
    injectAuthModal();

    // 1. Navbar: Update "Sign in" button to show username if logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authBtn = document.querySelector('.btn-signin');
    
    if (currentUser && authBtn) {
        const encodedName = encodeURIComponent(currentUser.username);
        authBtn.innerHTML = `<img src="https://ui-avatars.com/api/?name=${encodedName}&background=ffffff&color=10b981&bold=true" style="width: 28px; height: 28px; border-radius: 50%;"> <span>${currentUser.username}</span>`;
        authBtn.href = 'profile.html';
        authBtn.style.display = 'flex';
        authBtn.style.alignItems = 'center';
        authBtn.style.gap = '0.5rem';
        authBtn.style.background = '#10b981'; // Green color to highlight profile
        authBtn.style.color = 'white';
        authBtn.style.border = '2px solid transparent';
        authBtn.style.padding = '0.4rem 1.2rem 0.4rem 0.5rem';
        authBtn.style.borderRadius = '9999px';
        authBtn.style.fontWeight = '600';
    }

    // 2. Signin Page: Handle form submission to login via API
    const loginForm = document.querySelector('.auth-form');
    if (loginForm && window.location.pathname.includes('signin.html')) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('currentUser', JSON.stringify(data.user || { username: 'Admin', role: 'admin' }));
                    window.location.href = 'home.html';
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
            }
        });
    }

    // 3. Profile Page: Handle logout
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
        });
    }

    // 4. Signup Page: Handle mock registration
    if (window.location.pathname.includes('signup.html')) {
        const signupForm = document.getElementById('signupForm');
        const signupFormContainer = document.getElementById('signupFormContainer');
        const successContainer = document.getElementById('signupSuccessContainer');
        const welcomeMsg = document.getElementById('welcomeMessage');

        // Check if we just came back from PDPA with success
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('status') === 'success') {
            const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
            if (pendingUser && signupFormContainer && successContainer) {
                // Actual Registration in Database - wrap in async IIFE or change logic
                (async () => {
                    try {
                        const response = await fetch('/api/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(pendingUser)
                        });
                        const data = await response.json();
                        
                        if (data.success) {
                            signupFormContainer.style.display = 'none';
                            successContainer.style.display = 'block';
                            if (welcomeMsg) {
                                welcomeMsg.textContent = `WELCOME, ${data.user.username}! 🎉`;
                            }
                            localStorage.setItem('currentUser', JSON.stringify(data.user));
                            localStorage.removeItem('pendingUser');
                        } else {
                            alert(data.message || 'Signup failed');
                            window.location.href = 'signup.html';
                        }
                    } catch (err) {
                        console.error('Signup error:', err);
                        alert('เกิดข้อผิดพลาดในการลงทะเบียน');
                    }
                })();
            }
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                const username = document.getElementById('username') || { value: 'New User' };
                const email = document.getElementById('email');
                const password = document.getElementById('password');
                const confirmPassword = document.getElementById('confirm-password');
                const branch = document.getElementById('branch');

                if(password && confirmPassword && password.value !== confirmPassword.value) {
                    e.preventDefault();
                    alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!');
                    return;
                }

                const userObj = {
                    username: username.value,
                    email: email ? email.value : '',
                    password: password ? password.value : '',
                    faculty: branch ? branch.value : 'cs',
                    visible: true
                };
                
                localStorage.setItem('pendingUser', JSON.stringify(userObj));
                // Form will naturally submit to pdpa.html (as per action attribute)
            });
        }
    }

    // 5. Modal Logic (Edit Profile)
    const editBtn = document.querySelector('.btn-edit');
    const editModal = document.getElementById('editProfileModal');
    const closeBtns = document.querySelectorAll('#closeEditModal, #cancelEditModal');
    
    if (editBtn && editModal) {
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // prevent bg scrolling
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                editModal.classList.remove('show');
                document.body.style.overflow = '';
            });
        });

        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
        
        const editForm = document.getElementById('editProfileForm');
        if(editForm) {
            // Pre-fill toggle status
            const visibilityToggle = document.getElementById('profileVisibility');
            if (visibilityToggle && currentUser) {
                visibilityToggle.checked = currentUser.visible !== false;
            }

            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Get visibility status
                const isVisible = document.getElementById('profileVisibility').checked;
                const majorSelect = editForm.querySelector('.form-select');
                const genInput = editForm.querySelector('input[value*="ปี"]');
                
                // Real update in Database
                try {
                    const response = await fetch(`/api/users/${currentUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...currentUser,
                            visible: isVisible,
                            faculty: majorSelect ? majorSelect.value : currentUser.faculty,
                            age: genInput ? genInput.value : currentUser.age // Using age field for gen/age etc
                        })
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        localStorage.setItem('currentUser', JSON.stringify(data.user));
                        editModal.classList.remove('show');
                        document.body.style.overflow = '';
                        alert('อัปเดตข้อมูลเรียบร้อยแล้ว!');
                        window.location.reload();
                    } else {
                        alert(data.message || 'Update failed');
                    }
                } catch (err) {
                    console.error('Update error:', err);
                    alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
                }
            });
        }
    }

    // 7. Generation Filter Logic (Working with Dynamic Cards)
    const setupFilterLogic = () => {
        const filterBtns = document.querySelectorAll('.gen-btn');
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const parentFilter = this.closest('.gen-filter');
                    if (parentFilter) {
                        parentFilter.querySelectorAll('.gen-btn').forEach(b => b.classList.remove('active'));
                    }
                    this.classList.add('active');
                    
                    const filterText = this.textContent.trim();
                    const isAll = filterText.includes('ทั้งหมด');
                    const targetGenMatch = filterText.match(/\d+/); // Just look for digits like 68, 67
                    const targetGen = targetGenMatch ? targetGenMatch[0] : '';

                    const memberCardsContainer = document.querySelector('.members-grid');
                    if (memberCardsContainer) {
                        const allMemberLinks = memberCardsContainer.querySelectorAll('a');
                        allMemberLinks.forEach(wrapper => {
                            const badge = wrapper.querySelector('.member-badge');
                            if (!badge) {
                                wrapper.style.display = isAll ? '' : 'none';
                                return;
                            }
                            
                            const badgeText = badge.textContent.trim();
                            if (isAll) {
                                wrapper.style.display = '';
                            } else if (targetGen && badgeText.includes(targetGen)) {
                                wrapper.style.display = '';
                            } else {
                                wrapper.style.display = 'none';
                            }
                        });
                    }
                });
            });
        }
    };
    setupFilterLogic();

    // 8. Dynamic linkage for member cards (Branch Pages)
    const memberGridContainer = document.querySelector('.members-grid');
    if (memberGridContainer) {
        const memberLinks = memberGridContainer.querySelectorAll('a');
        memberLinks.forEach(link => {
            const nameEl = link.querySelector('.member-name');
            if (nameEl) {
                const nameText = nameEl.textContent.trim();
                link.href = `profile.html?user=${encodeURIComponent(nameText)}`;
            }
        });
    }

    // 9. Profile View Logic (Auth Guard & Real Data Fetching)
    if (window.location.pathname.includes('profile.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // --- AUTH GUARD (Page Level) ---
        if (!currentUser) {
            // If they land here directly, we just send them to signin
            window.location.href = 'signin.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const viewUserId = urlParams.get('id'); 
        
        let isOwnProfile = true;

        const loadProfileData = async (id) => {
            try {
                const response = await fetch(`/api/users/${id}`);
                const data = await response.json();
                if (response.ok) {
                    renderProfile(data);
                } else {
                    console.error('User not found');
                }
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        const renderProfile = (user) => {
            const usernameEl = document.querySelector('.profile-username');
            const emailEl = document.querySelector('.profile-email') || document.createElement('p'); // Fallback
            const facultyEl = document.querySelector('.profile-major') || document.querySelector('.profile-bio p');

            if (usernameEl) usernameEl.textContent = user.username;
            if (emailEl) emailEl.textContent = user.email;
            
            // Customize avatar
            const avatarImg = document.querySelector('.profile-avatar');
            if (avatarImg) {
                avatarImg.src = user.photo && user.photo !== 'default.png' ? user.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=250`;
            }

            if (!isOwnProfile) {
                const profileActions = document.querySelector('.profile-actions');
                if (profileActions) profileActions.style.display = 'none';
            }
        };

        if (viewUserId && viewUserId != currentUser.id) {
            isOwnProfile = false;
            loadProfileData(viewUserId);
        } else {
            renderProfile(currentUser);
        }
    }

    // 10. Dynamic Member Fetching & Insertion (Full List)
    const loadMajorMembers = async () => {
        const majorMapInverse = {
            'comsci.html': 'cs',
            'mathstat.html': 'math',
            'bio.html': 'bio',
            'chem.html': 'chem',
            'gensci.html': 'gen',
            'matsci.html': 'mat',
            'micro.html': 'micro',
            'physics.html': 'phy'
        };

        const currentPath = window.location.pathname.split('/').pop();
        const currentMajorCode = majorMapInverse[currentPath];
        const membersGrid = document.querySelector('.members-grid');

        if (membersGrid && currentMajorCode) {
            try {
                const response = await fetch('/api/users');
                const users = await response.json();
                
                // --- FIX: Check if users is an array ---
                if (!Array.isArray(users)) {
                    console.error('Expected array from /api/users, got:', users);
                    membersGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">ไม่สามารถโหลดข้อมูลสมาชิกได้</p>';
                    return;
                }
                
                // Filter by major and optional visibility (though API usually handles visibility)
                const majorUsers = users.filter(u => u.faculty === currentMajorCode);

                // Clear current placeholders
                membersGrid.innerHTML = '';

                if (majorUsers.length === 0) {
                    membersGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">ขออภัย ยังไม่มีสมาชิกในสาขานี้</p>';
                    return;
                }

                // Render each user
                majorUsers.forEach(user => {
                    const card = document.createElement('a');
                    card.href = `profile.html?id=${user.id}`;
                    card.className = `member-card branch-${currentMajorCode}-bg`;
                    
                    const avatarUrl = user.photo && user.photo !== 'default.png' ? user.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=200`;
                    
                    card.innerHTML = `
                        <img src="${avatarUrl}" alt="Avatar" class="member-avatar">
                        <span class="member-name">${user.username}</span>
                        <span class="member-badge">${user.age || 'ปี 1 (68)'}</span>
                    `;
                    membersGrid.appendChild(card);
                });
                
                // Refresh filter logic to ensure it can see the new cards
                setupFilterLogic();
                
            } catch (err) {
                console.error('Error loading members:', err);
            }
        }
    };
    loadMajorMembers();

    // 11. Share Profile Button Logic
    const currentPath = window.location.pathname.split('/').pop();
    const isBranchPage = Object.values(majorMap).includes(currentPath);

    if (isBranchPage && currentUser) {
        const shareBtn = document.createElement('button');
        shareBtn.className = 'floating-share-btn';
        shareBtn.innerHTML = '<span>🔗 แชร์โปรไฟล์ของฉัน</span>';
        shareBtn.title = 'Copy profile link to clipboard';
        
        document.body.appendChild(shareBtn);
        
        shareBtn.addEventListener('click', () => {
            const profileUrl = `${window.location.origin}/profile.html?id=${currentUser.id}`;
            navigator.clipboard.writeText(profileUrl).then(() => {
                const originalText = shareBtn.innerHTML;
                shareBtn.innerHTML = '<span>✅ คัดลอกแล้ว!</span>';
                shareBtn.style.background = '#10b981';
                setTimeout(() => {
                    shareBtn.innerHTML = originalText;
                    shareBtn.style.background = '';
                }, 2000);
            });
        });
    }

});
