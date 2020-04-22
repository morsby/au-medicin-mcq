import { loadQuestions, answerQuestions } from '../utils/utils';

const searchQuestion = () => {
  cy.frontpage();
  cy.get('input[placeholder="Søg..."]').type('cancer');
  cy.contains('button', 'start', { matchCase: false }).click();
  cy.contains('div', 'spørgsmål 1 af 1', { matchCase: false }).should('exist');
  cy.contains('div', 'spørgsmål 1 af 5', { matchCase: false }).should('not.exist');
};

describe('quiz', () => {
  before(() => {
    cy.frontpage();
  });

  describe('load quiz from selection', () => {
    it('should load 5 questions', () => {
      loadQuestions();
    });

    it('should answer questions', () => {
      answerQuestions();
    });

    it('should be able to open public comments', () => {
      cy.contains('offentlig').click();
      cy.contains('Skjul').should('exist');
      cy.contains('privat').should('not.exist');
    });

    it('should not be able to vote for tags, when not logged in', () => {
      cy.get('.ui > Icon > .up').should('not.exist');
      cy.get('.ui > Icon > .down').should('not.exist');
    });
  });

  describe('search', () => {
    it('should fail if searching for word that is unavailable', () => {
      cy.frontpage();
      cy.get('input[placeholder="Søg..."]').type('nefropati');
      cy.contains('button', 'start', { matchCase: false }).click();
      cy.contains('h1', 'ingen spørgsmål', { matchCase: false }).should('exist');
    });

    it('should load 1 question based on search', () => {
      searchQuestion();
    });

    it('should fail if searching for word that is unavailable', () => {
      cy.frontpage();
      cy.get('input[placeholder="Søg..."]').type('nefropati');
      cy.contains('button', 'start', { matchCase: false }).click();
      cy.contains('h1', 'ingen spørgsmål', { matchCase: false }).should('exist');
    });

    it('should load 1 question again based on search', () => {
      searchQuestion();
    });
  });
});
