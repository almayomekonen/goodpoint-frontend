/// <reference types="Cypress" />
import { fakeUser } from '../functions/fake-user'

describe("sent opening sentence to a student", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.asAdmin(() => {
            cy.visit('/')
            cy.get('button.clear-icon').click()
        })
    });
    it("should sent good point  that contain opening sentence to a student", () => {
        cy.get('.btn-add-gp').click()
        cy.get(':nth-child(1) > .good-point-receiver-students-group > :nth-child(1) > .card-container > .user-card-container')
            .click()
        cy.get('.startIcons').click()
        cy.get('.muirtl-8atqhb > :nth-child(2) > .MuiBox-root > :nth-child(1)')
            .invoke('text')
            .then(clickedText => {
                // Click on the element to select a predefined message
                cy.get('.muirtl-8atqhb > :nth-child(2) > .MuiBox-root > :nth-child(1)').click();
                cy.get('.sendIcon').click();

                // Check if the .bubble element contains the same text
                cy.get('.bubble')
                    .should('contain', clickedText.trim());
            });
    })
})
