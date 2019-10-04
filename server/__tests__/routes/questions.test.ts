import _ from 'lodash';
import request from 'supertest';
import { cleanUp, createUsers, createQuestions } from '../../_testconfigs_/functions/creation';
const questionApi = '/api/questions';
let server;
let admin;

// Settings vars to reuse across tests
let username;
let password;

beforeEach(async () => {
  username = 'admin';
  password = '123abc';

  server = require('../../server');
  admin = request.agent(server);

  // Insert needed data
  await createUsers();
  await createQuestions();

  // Login admin before each test
  let res = await admin.post('/api/auth').send({ username, password });
  let { type } = res.body;

  expect(type).toEqual('LoginSuccess');
});

afterEach(async () => {
  // Cleanup
  await cleanUp();
  server.close();
});

describe('questions route', () => {
  it("GET '/' -- should get all 5 test questions", async () => {
    let { body } = await request(server).get(`${questionApi}?n=100`);

    expect(body.length).toEqual(5);
    expect(body[0]).toHaveProperty('correctAnswers');
    expect(body[0]).toHaveProperty('semester');
    expect(body[0]).toHaveProperty('publicComments');
    expect(body[0].privateComments).toBeFalsy();

    let orderedQuestions = _.sortBy(body, ['id']);
    expect(orderedQuestions[0].tags).toHaveLength(1);
    expect(orderedQuestions[0].specialties).toHaveLength(1);

    expect(orderedQuestions[4].specialties.map((s) => s.specialtyId)).toEqual([5]);
  });

  it("GET '/?ids=...' -- should fetch three questions", async () => {
    let { body } = await request(server).get(`${questionApi}?ids=1,3,5`);

    expect(body).toHaveLength(3);
  });

  it("GET '/' -- should complete because admin", async () => {
    await admin.post('/api/auth').send({ username, password });

    let { body } = await admin.get(questionApi);
    expect(body.length).toEqual(5);
    // Testes her fordi vi alligevel er logget ind.
    expect(body[0]).toHaveProperty('privateComments');
  });

  it("GET '/' -- should fail if not providing n and not admin", async () => {
    let { status, body } = await request(server).get(questionApi);
    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  it("POST '/' -- should fail because not admin", async () => {
    let { body, status } = await request(server)
      .post(questionApi)
      .send({
        text: 'Test',
        answer1: 'Svar 1',
        answer2: 'Svar 2',
        answer3: 'Svar 3',
        correctAnswers: [1],
        examSetId: 1,
        examSetQno: 5
      });

    expect(body.type).toEqual('NotAuthorized');
    expect(status).toEqual(403);
  });

  it("POST '/' -- should insert new question", async () => {
    let { body } = await admin.post(questionApi).send({
      text: 'Test',
      answer1: 'Svar 1',
      answer2: 'Svar 2',
      answer3: 'Svar 3',
      correctAnswers: [1],
      examSetId: 1,
      examSetQno: 5
    });

    expect(body.text).toEqual('Test');
    expect(body.correctAnswers).toEqual([1]);
  });

  it("POST '/' -- should fail with invalid correct answer", async () => {
    let { status, body } = await admin.post(questionApi).send({
      text: 'Test',
      answer1: 'Svar 1',
      answer2: 'Svar 2',
      answer3: 'Svar 3',
      correctAnswers: [0],
      examSetId: 1,
      examSetQno: 5
    });

    expect(status).toEqual(400);
    expect(body.type).toEqual('ModelValidation');
  });

  it("POST '/' -- should fail with duplicated correct answers", async () => {
    let { status, body } = await admin.post(questionApi).send({
      text: 'Test',
      answer1: 'Svar 1',
      answer2: 'Svar 2',
      answer3: 'Svar 3',
      correctAnswers: [3, 3],
      examSetId: 1,
      examSetQno: 5
    });

    expect(status).toEqual(409);
    expect(body.type).toEqual('UniqueViolation');
  });

  it("POST '/search' -- should find results", async () => {
    let { body } = await request(server)
      .post(`${questionApi}/search`)
      .send({ searchString: 'læge psa' });

    expect(body).toHaveLength(3);
  });

  it("POST '/search' -- should not find results", async () => {
    let { body } = await request(server)
      .post(`${questionApi}/search`)
      .send({ searchString: 'ASDHASDhaksjdashdjkj' });

    expect(body).toHaveLength(0);
  });

  it("GET '/:id' -- should fetch one question", async () => {
    let { body } = await request(server).get(`${questionApi}/1`);

    expect(body.id).toEqual(1);
    expect(body).toHaveProperty('publicComments');
    expect(body.correctAnswers.length).toBeGreaterThan(0);
  });

  it("PATCH '/:id' -- should fail because not admin", async () => {
    let { status, body } = await request(server)
      .patch(`${questionApi}/1`)
      .send({ text: 'Test af patch' });

    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  it("PATCH '/:id' -- should patch an existing question", async () => {
    let { body } = await admin.patch(`${questionApi}/1`).send({ text: 'Test af patch' });

    expect(body.text).toEqual('Test af patch');
    expect(body.id).toEqual(1);
  });

  it("PUT '/:id/vote' -- should vote for a specialty", async () => {
    let { body } = await admin
      .put(`${questionApi}/1/vote`)
      .send({ type: 'specialty', id: 1, value: 1 });

    expect(body.specialties[0].specialtyId).toEqual(1);
    expect(body.userSpecialtyVotes).toHaveLength(1);
  });

  it("PUT '/:id/vote' -- should delete votes when providing value = 'delete'", async () => {
    let { body } = await admin
      .put(`${questionApi}/1/vote`)
      .send({ type: 'specialty', id: 1, value: 'delete' });

    expect(body.specialties).toHaveLength(0);
    expect(body.userSpecialtyVotes).toHaveLength(0);
  });

  it("PUT '/:id/vote' -- should fail if not logged in", async () => {
    let { status, body } = await request(server)
      .put(`${questionApi}/1/vote`)
      .send({ specialtyVotes: [1] });

    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  it("POST '/:id/answer' -- WITHOUT auth -- should save an answer to the database", async () => {
    let { body } = await request(server)
      .post(`${questionApi}/1/answer`)
      .send({ answer: 3 });

    expect(body.type).toEqual('QuestionAnswerSuccess');
    expect(body.data.question.id).toEqual(1);
  });

  it("POST '/:id/answer' -- WITH auth -- should save an answer to the database", async () => {
    let { body } = await admin.post(`${questionApi}/1/answer`).send({ answer: 2 });

    expect(body.type).toEqual('QuestionAnswerSuccess');
    expect(body.data.question.id).toEqual(1);
  });

  it("POST '/:id/answer' -- should fail with invalid answer", async () => {
    let { status, body } = await request(server)
      .post(`${questionApi}/1/answer`)
      .send({ answer: 'Forkert' });

    expect(status).toEqual(400);
    expect(body.type).toEqual('InvalidData');
  });

  it("POST '/:id/comment' -- should insert a comment", async () => {
    let { status, body } = await admin
      .post(`${questionApi}/1/comment`)
      .send({ text: 'Dette er en test', isPrivate: false, isAnonymous: false });

    expect(status).toEqual(200);
    expect(body.publicComments).toHaveLength(2);
    expect(body.publicComments[1].text).toEqual('Dette er en test');
  });

  it("POST '/:id/comment' -- should fail because not logged in", async () => {
    let { status, body } = await request(server).post(`${questionApi}/1/comment`);

    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  it("PATCH '/:id/comment/:commentId' -- should patch a comment", async () => {
    let { status, body } = await admin.patch(`${questionApi}/1/comment/1`).send({
      text: 'opdateret text',
      isPrivate: false,
      isAnonymous: false
    });

    expect(status).toEqual(200);
    expect(body.publicComments[0].text).toEqual('opdateret text');
  });

  it("DELETE '/:id/comment/:commentId' -- should delete a comment", async () => {
    let { status, body } = await admin.delete(`${questionApi}/1/comment/1`);

    expect(status).toEqual(200);
    expect(body.publicComments).toHaveLength(0);
  });

  it("DELETE '/:id' -- should fail because not admin", async () => {
    let { status, body } = await request(server).delete(`${questionApi}/1`);
    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  it("DELETE '/:id' -- should delete a question", async () => {
    let { body } = await admin.delete(`${questionApi}/1`);

    expect(body.type).toEqual('deleteQuestion');
    expect(body.message).toEqual('Succesfully deleted 1 question');
  });
});
