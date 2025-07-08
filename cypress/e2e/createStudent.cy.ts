/// <reference types="Cypress" />

import { faker } from "@faker-js/faker"

describe("create student ", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login({
      username: "one@gmail.com",
      password: "vzn4oqi2",
      superAdmin: false,
    });
  });
  it("should create a student", () => {
    cy.get(".tab").contains("מערכת ניהול").click();
    cy.get("[data-cy=create-student-btn]").click();
    cy.get("input[name=firstName]").type(faker.person.firstName());
    cy.get("input[name=lastName]").type(faker.person.lastName());
    cy.get(".MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root")
      .parent()
      .click();
    cy.get("ul").contains("ג1").click();
    cy.get('[type="radio"]').first().check();
    cy.get("input[name='relativesPhoneNumbers[0].phone']").type("0543675434");
    cy.get(".admin-popup-buttons-container > .MuiButton-contained").click();
  });
});

