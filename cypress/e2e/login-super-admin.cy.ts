/// <reference types="Cypress" />
describe("login in ",  () => {
  beforeEach(() => {
  });

  it("should log in as a super-admin", () => {
    //expect certain cookies
    // cy.intercept("POST", "/api/staff/login").as("loginRequest");
    cy.request({
      url: 'http://localhost:8080/api/staff/login',
      body: {
        username: "admin@carmel6000.amitnet.org",
        password: "E2PSzAmJ-5-ldKnl",
      },
      method: "POST"
    }).then(() => {
      cy.visit('/')
      cy.getCookie("kloklokl").should("exist");
    })
  });
});
