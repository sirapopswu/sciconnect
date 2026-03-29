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