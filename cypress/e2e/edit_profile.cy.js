describe('Edit Profile UI Tests', () => {
    const baseUrl = 'http://localhost:3000';

    beforeEach(() => {
        cy.clearLocalStorage();
        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@gmail.com',
            student_id: '65000000',
            major: 'cs',
            gender: 'ชาย',
            visible: true
        };
        cy.window().then((win) => {
            win.localStorage.setItem('user', JSON.stringify(mockUser));
        });
    });

    it('UI-08: ทดสอบแก้ไขข้อมูลโปรไฟล์ (Edit Profile)', () => {
        cy.intercept('PUT', '/api/users/*', {
            statusCode: 200,
            body: { user: { id: 1, bio: 'Updated Bio from Cypress' } }
        }).as('updateProfile');

        cy.visit(`${baseUrl}/edit_profile.html`);
        
        cy.get('#bio').clear().type('Updated Bio from Cypress');
        cy.get('.btn-save').click();
        
        cy.wait('@updateProfile');
        cy.get('body').should('contain.text', 'อัปเดตข้อมูลสำเร็จ');
        cy.url().should('include', 'profile.html');
    });
});
