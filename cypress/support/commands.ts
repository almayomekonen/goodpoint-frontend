import { faker } from "@faker-js/faker";
declare global {
  namespace Cypress {
    interface Chainable {
      // Define your custom command here
      login: (options: {
        username: string;
        password: string;
        superAdmin: boolean;
      }) => Chainable<any>;
      getByDataCy: (arg: string) => Chainable<any>;
      asAdmin: (run: () => void) => Chainable<any>;
      asSuperAdmin: (run: () => void) => Chainable<any>;
    }
  }
}

Cypress.Commands.add(
  "login",
  (options: { username: string; password: string; superAdmin: boolean }) => {
    cy.request({
      url: "http://localhost:8080/api/staff/login",
      body: {
        username: options.username,
        password: options.password,
      },
      method: "POST",
    })
      .its("status")
      .should("equal", 201);
  }
);

Cypress.Commands.add("getByDataCy", (data) => {
  cy.get(`[data-cy=${data}]`);
});

Cypress.Commands.add("asAdmin", (run: () => void) => {
  cy.login({
    username: "admin@carmel6000.amitnet.org",
    password: "E2PSzAmJ-5-ldKnl",
    superAdmin: true,
  }).then(() => {
    //now request a new user and retrieve the new password and username
    const username = faker.internet.email();
    const gender = "MALE";
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const schoolId = 1;
    cy.request({
      method: "POST",
      url: "http://localhost:8080/api/staff/add-admin",
      body: {
        username,
        schoolId,
        firstName,
        lastName,
        gender,
      },
    })
      .then((res) => {
        cy.login({ username, password: res.body.password, superAdmin: false });
      })
      .then(run);
  });
});

Cypress.Commands.add("asSuperAdmin", (run: () => void) => {
  cy.login({
    username: "admin@carmel6000.amitnet.org",
    password: "E2PSzAmJ-5-ldKnl",
    superAdmin: true,
  }).then(run);
});
