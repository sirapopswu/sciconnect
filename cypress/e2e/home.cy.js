describe('Home Page UI Tests', () => {
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

    it('UI-06: ทดสอบการกรองข้อมูลด้วยเมนูดรอปดาวน์ (Home Page)', () => {
        cy.visit(`${baseUrl}/home.html`);
        
        cy.get('a[href="comsci.html"]').click();
        
        cy.url().should('include', 'comsci.html');
        cy.get('body').should('contain.text', 'กำลังดึงข้อมูลเพื่อนๆ สาขา CS');
    });

    it('UI-07: ทดสอบช่องค้นหาผู้ใช้ (Home Page)', () => {
        cy.visit(`${baseUrl}/home.html`);
        
        cy.get('.nav-search-btn').click();
        
        cy.get('#mSearchKeyword').type('test');
        cy.get('.search-modal-btn').click();
        
        cy.get('#searchResults').should('be.visible');
    });
});
