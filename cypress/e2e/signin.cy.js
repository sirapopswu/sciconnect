describe('Sign In Page UI Tests', () => {
    const baseUrl = 'http://localhost:3000';

    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('UI-01: ทดสอบเข้าสู่ระบบสำเร็จ (Sign In Page)', () => {
        cy.intercept('POST', '/api/users/login', {
            statusCode: 200,
            body: {
                user: { id: 1, username: 'testuser', email: 'test@gmail.com', role: 'user' }
            }
        }).as('loginSuccess');

        cy.visit(`${baseUrl}/signin.html`);
        cy.get('#email').type('test@gmail.com');
        cy.get('#password').type('correctpassword');
        cy.get('.auth-btn-signin').click();

        cy.wait('@loginSuccess');

        // ตรวจสอบข้อความบน Alert Modal และคลิกปุ่มตกลงเพื่อให้ redirect ไปยังหน้า home
        cy.get('#alertMessage').should('contain.text', 'ยินดีต้อนรับ');
        cy.get('#alertBtn').should('be.visible').click();

        cy.url().should('include', 'home.html');
    });

    it('UI-02: ทดสอบเข้าสู่ระบบด้วยข้อมูลที่ไม่ถูกต้อง (Sign In Page)', () => {
        cy.intercept('POST', '/api/users/login', {
            statusCode: 401,
            body: { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
        }).as('loginFail');

        cy.visit(`${baseUrl}/signin.html`);
        cy.get('#email').type('wrong@gmail.com');
        cy.get('#password').type('wrongpass');
        cy.get('.auth-btn-signin').click();

        cy.wait('@loginFail');

        // ตรวจสอบข้อความ Error บน Alert Modal และปิด Modal
        cy.get('#alertMessage').should('contain.text', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        cy.get('#alertBtn').should('be.visible').click();

        cy.url().should('include', 'signin.html');
    });

    it('UI-03: ทดสอบไม่กรอกข้อมูลเข้าสู่ระบบ (Sign In Page)', () => {
        cy.visit(`${baseUrl}/signin.html`);
        cy.get('.auth-btn-signin').click();
        cy.get('input:invalid').should('have.length', 2);
    });
});
