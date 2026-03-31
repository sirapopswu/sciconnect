// app.js - Signup form handler
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const studentId = document.getElementById('studentid').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const major = document.getElementById('branch').value;

        if (!studentId || !email || !password || !confirmPassword || !major) {
            alert('กรุณากรอกฟอร์มให้ครบ');
            return;
        }

        if (password !== confirmPassword) {
            alert('รหัสผ่านไม่ตรงกัน');
            return;
        }

        // เก็บข้อมูลไว้ชั่วคราว
        localStorage.setItem('signupData', JSON.stringify({
            studentId,
            email,
            password,
            major
        }));

        // redirect ไปหน้า pdpa
        window.location.href = 'pdpa.html';
    });
}

// --- Authentication State & Profile Management ---
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    const signinBtns = document.querySelectorAll('.btn-signin');
    
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
                const dGen = document.getElementById('displayGen');
                
                // Use generation from API (derived by backend) or fallback to ID
                const derivedGen = user.generation || (user.student_id ? user.student_id.substring(0, 2) : '-');
                
                const dEmail = document.getElementById('displayEmail');
                const dGender = document.getElementById('displayGender');
                
                if (dUsername) dUsername.textContent = user.username || 'Admin';
                if (dGen) dGen.textContent = user.age || 'ปี 1';
                if (dMajor) dMajor.textContent = (user.major || '').toUpperCase();
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
            
            // Pre-fill form
            document.getElementById('display-name').value = user.username || '';
            document.getElementById('studentid').value = user.student_id || '';
            document.getElementById('branch').value = user.major || 'cs';
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
                const studentId = document.getElementById('studentid').value.trim();
                const age = document.getElementById('age').value;
                const major = document.getElementById('branch').value;
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
                        username,
                        age,
                        major,
                        bio,
                        skills: JSON.stringify(skillsArray),
                        photo: photoBase64,
                        email: user.email,
                        password: user.password,
                        gender: user.gender
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
});