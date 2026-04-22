describe('PDPA Page UI Tests', () => {
    const baseUrl = 'http://localhost:3000';

    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('UI-09: ทดสอบการกดยินยอม (Accept) PDPA สำเร็จ', () => {
        // Mock ข้อมูล signup ใน localStorage เสมือนว่ามาจากหน้า signup.html
        const signupData = {
            username: 'testuser',
            studentId: '65000000',
            password: 'password123',
            email: 'test@g.swu.ac.th',
            major: 'cs',
            gender: 'ชาย',
            age: '20'
        };
        cy.window().then((win) => {
            win.localStorage.setItem('signupData', JSON.stringify(signupData));
        });

        // Intercept API สร้างผู้ใช้งานใหม่
        cy.intercept('POST', '/api/users', {
            statusCode: 201,
            body: { message: 'User created successfully', user: signupData }
        }).as('createUser');

        cy.visit(`${baseUrl}/pdpa.html`);

        // กดปุ่มยินยอม
        cy.get('#acceptBtn').click();

        cy.wait('@createUser');

        // ตรวจสอบ Alert Modal แจ้งเตือนสำเร็จและกดยืนยัน (ปิด modal)
        cy.get('#alertMessage').should('contain.text', 'สมัครสำเร็จ!');
        cy.get('#alertBtn').should('be.visible').click();

        // ตรวจสอบว่าเปลี่ยนทางไปหน้า signin.html
        cy.url().should('include', 'signin.html');
    });

    it('UI-10: ทดสอบการกดยินยอม (Accept) โดยไม่มีข้อมูล Signup', () => {
        cy.visit(`${baseUrl}/pdpa.html`);

        // กดปุ่มยินยอมโดยที่ localStorage ว่างเปล่า
        cy.get('#acceptBtn').click();

        // ตรวจสอบ Error Alert Modal และกดปิด
        cy.get('#alertMessage').should('contain.text', 'ไม่มีข้อมูลสำหรับสมัคร');
        cy.get('#alertBtn').should('be.visible').click();

        // ตรวจสอบว่าโดนเด้งกลับไปหน้า signup.html ให้กรอกใหม่
        cy.url().should('include', 'signup.html');
    });

    it('UI-11: ทดสอบการกดปฏิเสธ (Decline) PDPA', () => {
        cy.visit(`${baseUrl}/pdpa.html`);

        // กดปุ่มปฏิเสธ
        cy.get('.btn-decline').click();

        // ต้องกลับไปหน้า signup ทันที
        cy.url().should('include', 'signup.html');
    });
});
