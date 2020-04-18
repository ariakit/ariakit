/* global cy, context */
// eslint-disable-next-line
/// <reference types="cypress" />

context("TooltipWithToolbar", () => {
  beforeEach(() => {
    cy.openExample("Tooltip", "TooltipWithToolbar");
  });

  it("tooltips should show on mouse clicks", () => {
    cy.contains("item1").trigger("mouseover");
    cy.contains("item1tooltip").should("be.visible");
    cy.contains("item1").click();
    cy.contains("item1").should("be.focused");
    cy.contains("item2").click();
    cy.contains("item2tooltip").should("be.visible");
  });

  it("cycle through tooltips with keyboard", () => {
    cy.contains("item1").click();
    cy.contains("item1").should("be.focused");
    cy.contains("item1tooltip").should("be.visible");
    cy.contains("item1").trigger("keydown", { key: "ArrowRight" });
    cy.contains("item2").should("be.focused");
    cy.contains("item2tooltip").should("be.visible");
    cy.contains("item2").trigger("keydown", { key: "ArrowRight" });
    cy.contains("item3").should("be.focused");
    cy.contains("item3tooltip").should("be.visible");
  });
});
