describe("admin login", () => {


  it("should log in as an admin", () => {
    cy.asAdmin(() => {
      cy.visit('/')
      cy.getCookie("kloklokl").should("exist");
      cy.get('button.clear-icon').click()
      cy.get("button").contains("נקודות שקיבלתי").should("exist");
      cy.get("button").contains("נקודות שקיבלתי").click();
    });
  });

});
