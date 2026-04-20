// pdpa.js
const pdpaForm = document.getElementById('pdpaForm');
const successMessage = document.getElementById('successMessage');

if (pdpaForm) {
    pdpaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const consent = document.getElementById('pdpaConsent').checked;
        if (!consent) {
            showToast('คุณต้องยอมรับ PDPA ก่อน', 'error');
            return;
        }

        const signupData = JSON.parse(localStorage.getItem('signupData'));
        if (!signupData) {
            showToast('ไม่มีข้อมูลสำหรับสมัคร กรุณากรอกแบบฟอร์ม Signup ใหม่', 'error');
            setTimeout(() => {
                window.location.href = 'signup.html';
            }, 2000);
            return;
        }

        try {
            const payload = {
                username: signupData.username,
                student_id: signupData.studentId,
                password: signupData.password,
                email: signupData.email,
                major: signupData.major,
                gender: signupData.gender,
                age: signupData.gen,
                photo: 'default.png'
            };
            
            console.log('Final registration payload:', payload);

            const res = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                // clear localStorage
                localStorage.removeItem('signupData');
                pdpaForm.style.display = 'none';
                successMessage.style.display = 'block';
                showToast('ลงทะเบียนสำเร็จ!', 'success');
            } else {
                showToast(data.message || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (err) {
            showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });
}