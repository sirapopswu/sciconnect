// pdpa.js
const pdpaForm = document.getElementById('pdpaForm');
const successMessage = document.getElementById('successMessage');

if (pdpaForm) {
    pdpaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const consent = document.getElementById('pdpaConsent').checked;
        if (!consent) {
            alert('คุณต้องยอมรับ PDPA ก่อน');
            return;
        }

        const signupData = JSON.parse(localStorage.getItem('signupData'));
        if (!signupData) {
            alert('ไม่มีข้อมูลสำหรับสมัคร กรุณากรอกแบบฟอร์ม Signup ใหม่');
            window.location.href = 'signup.html';
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: signupData.studentId,
                    password: signupData.password,
                    email: signupData.email,
                    major: signupData.major,
                    gender: signupData.gender,
                    age: signupData.gen,
                    photo: 'default.png'
                })
            });

            const data = await res.json();

            if (data.success) {
                // clear localStorage
                localStorage.removeItem('signupData');
                pdpaForm.style.display = 'none';
                successMessage.style.display = 'block';
            } else {
                alert(data.message || 'เกิดข้อผิดพลาด');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    });
}