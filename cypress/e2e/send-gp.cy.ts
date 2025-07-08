import { faker } from '@faker-js/faker'
describe("sending a good point", () => {
  beforeEach(() => {
    //now that we have created a admin , we need to logout from the super admin and log in again as an admin
    cy.asAdmin(() => {
      cy.visit('/')
    })
  })
  it("should send a good point", () => {
  })

})
