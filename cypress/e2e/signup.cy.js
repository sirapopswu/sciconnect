describe('Sign Up Page UI Tests', () => {
    const baseUrl = 'http://localhost:3000';

    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('UI-04: ทดสอบสมัครสมาชิกใหม่สำเร็จ (Sign Up Page)', () => {
        cy.visit(`${baseUrl}/signup.html`);
        
        cy.get('#username').type('newuser123');
        cy.get('#email').type('newuser@g.swu.ac.th');
        cy.get('#studentid').type('65000000');
        cy.get('#password').type('password123');
        cy.get('#confirm-password').type('password123');
        cy.get('#branch').select('cs');
        cy.get('#gender').select('ชาย');
        cy.get('#age').type('20');
        
        cy.get('form').submit();
        
        cy.url().should('include', 'pdpa.html');
        cy.window().its('localStorage.signupData').should('exist');
    });

    it('UI-05: ทดสอบสมัครสมาชิกโดยรหัสผ่านไม่ตรงกัน (Sign Up Page)', () => {
        cy.visit(`${baseUrl}/signup.html`);
        
        cy.get('#username').type('newuser123');
        cy.get('#email').type('newuser@g.swu.ac.th');
        cy.get('#studentid').type('65000000');
        cy.get('#password').type('password123');
        cy.get('#confirm-password').type('mismatch456');
        cy.get('#branch').select('cs');
        cy.get('#gender').select('ชาย');
        cy.get('#age').type('20');
        
        cy.get('form').submit();
        
        cy.get('body').should('contain.text', 'รหัสผ่านไม่ตรงกัน');
        cy.url().should('include', 'signup.html');
    });
});
