// public/app.js
document.addEventListener('DOMContentLoaded', () => {
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

    // 2. Signin Page: Handle form submission to mock login
    const loginForm = document.querySelector('.auth-form');
    if (loginForm && window.location.pathname.includes('signin.html')) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const studentId = document.getElementById('studentid').value;
            const name = studentId ? `User ${studentId.substring(0,3)}...` : 'My Profile';
            
            const existing = JSON.parse(localStorage.getItem('currentUser'));
            const userObj = existing || { 
                username: name, 
                major: 'cs', 
                isPublic: true,
                generation: 'ปี 1 (68)'
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userObj));
            window.location.href = 'home.html';
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
                signupFormContainer.style.display = 'none';
                successContainer.style.display = 'block';
                if (welcomeMsg) {
                    welcomeMsg.textContent = `WELCOME, ${pendingUser.username}! 🎉`;
                }
                // Save as actual user now that they accepted PDPA
                localStorage.setItem('currentUser', JSON.stringify(pendingUser));
                localStorage.removeItem('pendingUser');
            }
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                const studentId = document.getElementById('studentid');
                const branch = document.getElementById('branch');
                const password = document.getElementById('password');
                const confirmPassword = document.getElementById('confirm-password');

                if(password && confirmPassword && password.value !== confirmPassword.value) {
                    e.preventDefault();
                    alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!');
                    return;
                }

                if(studentId && branch) {
                    const name = studentId.value ? `User ${studentId.value.substring(0,3)}...` : 'New User';
                    const userObj = {
                        username: name,
                        major: branch.value || 'cs',
                        isPublic: true, 
                        generation: 'ปี 1 (68)'
                    };
                    // Save as PENDING until they accept PDPA
                    localStorage.setItem('pendingUser', JSON.stringify(userObj));
                    // Form will naturally submit to pdpa.html (as per action attribute)
                }
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
                visibilityToggle.checked = currentUser.isPublic !== false;
            }

            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get visibility status
                const isPublic = document.getElementById('profileVisibility').checked;
                const majorSelect = editForm.querySelector('.form-select');
                const genInput = editForm.querySelector('input[value*="ปี"]');
                
                // Mock update currentUser in localStorage
                const updatedUser = { 
                    ...currentUser, 
                    isPublic: isPublic,
                    major: majorSelect ? majorSelect.value : (currentUser.major || 'cs'),
                    generation: genInput ? genInput.value : (currentUser.generation || 'ปี 1 (68)')
                };
                
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                
                // Simulate save and upload
                editModal.classList.remove('show');
                document.body.style.overflow = '';
                alert('อัปเดตการตั้งค่าเรียบร้อยแล้ว!');
                window.location.reload(); // Reload to reflect changes in branch pages
            });
        }
    }

    // 7. Generation Filter Logic (Branch Pages)
    const filterBtns = document.querySelectorAll('.gen-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from sibling buttons
                const parentFilter = this.closest('.gen-filter');
                if (parentFilter) {
                    parentFilter.querySelectorAll('.gen-btn').forEach(b => b.classList.remove('active'));
                }
                
                // Add active class to clicked
                this.classList.add('active');
                
                const filterText = this.textContent.trim();
                const isAll = filterText.includes('ทั้งหมด');
                const targetGenMatch = filterText.match(/ปี\s*\d/);
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

    // 9. Profile View Logic (Viewing another profile vs Own profile)
    if (window.location.pathname.includes('profile.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const viewUser = urlParams.get('user');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        let displayUsername = "JohnDoe123";
        let isOwnProfile = true;

        if (viewUser) {
            displayUsername = viewUser;
            if (!currentUser || viewUser !== currentUser.username) {
                isOwnProfile = false;
            }
        } else if (currentUser) {
            displayUsername = currentUser.username;
        }

        const usernameEl = document.querySelector('.profile-username');
        if (usernameEl) {
            usernameEl.textContent = displayUsername;
        }

        if (!isOwnProfile) {
            // Hide Edit Profile and Logout because you are viewing someone else
            const profileActions = document.querySelector('.profile-actions');
            if (profileActions) {
                profileActions.style.display = 'none';
            }
            
            // Customize avatar
            const avatarImg = document.querySelector('.profile-avatar');
            if (avatarImg) {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUsername)}&background=random&color=fff&size=250`;
            }
        }
    }

    // 10. Dynamic Member Insertion (Branch Pages)
    // Map major values to filenames
    const majorMap = {
        'cs': 'comsci.html',
        'math': 'mathstat.html',
        'bio': 'bio.html',
        'chem': 'chem.html',
        'gen': 'gensci.html',
        'mat': 'matsci.html',
        'micro': 'micro.html',
        'phy': 'physics.html'
    };

    const currentPath = window.location.pathname.split('/').pop();
    const membersGrid = document.querySelector('.members-grid');

    if (membersGrid && currentUser && currentUser.isPublic !== false) {
        const userMajorFile = majorMap[currentUser.major || 'cs'];
        
        if (currentPath === userMajorFile) {
            // Remove the "empty" message if it exists
            const emptyMsg = membersGrid.querySelector('p');
            if (emptyMsg) emptyMsg.remove();

            // Create member card for current user
            const card = document.createElement('a');
            card.href = `profile.html`;
            card.className = `member-card branch-${currentUser.major || 'cs'}-bg`;
            
            const encodedName = encodeURIComponent(currentUser.username);
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=250`;
            
            card.innerHTML = `
                <img src="${avatarUrl}" alt="Avatar" class="member-avatar">
                <span class="member-name">${currentUser.username}</span>
                <span class="member-badge">${currentUser.generation || 'ปี 1 (68)'}</span>
            `;
            
            membersGrid.appendChild(card);
        }
    }
});
