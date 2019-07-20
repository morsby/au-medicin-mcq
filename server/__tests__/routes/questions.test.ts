import _ from 'lodash';
import request from 'supertest';
const questionApi = '/api/questions';
let server;
let agent;

// Settings vars to reuse across tests
let firstQuestionId;
let newQuestionId;
let newCommentId;

beforeEach(() => {
  server = require('../../server');
  agent = request.agent(server);
});

afterEach(() => {
  server.close();
});

describe('questions route', () => {
  test("GET '/' -- should get all 6 test questions", async () => {
    let { body } = await request(server).get(`${questionApi}?n=100`);

    // To reuse the id without making a second API call -- id can change if rerunning seeds
    firstQuestionId = body[0].id;

    expect(body.length).toEqual(6);
    expect(body[0]).toHaveProperty('correctAnswers');
    expect(body[0]).toHaveProperty('semester');
    expect(body[0]).toHaveProperty('publicComments');
    expect(body[0].privateComments).toBeFalsy();

    let orderedQuestions = _.sortBy(body, ['id']);
    expect(orderedQuestions[0].tags.map((t) => t.tagId)).toEqual([1, 2]);
    expect(orderedQuestions[0].specialties).toHaveLength(0);

    expect(orderedQuestions[5].specialties.map((s) => s.specialtyId)).toEqual([11, 13]);
  });

  test("GET '/?ids=...' -- should fetch three questions", async () => {
    let { body } = await request(server).get(`${questionApi}?ids=1,3,5`);

    expect(body).toHaveLength(3);
  });

  test("GET '/' -- should complete because admin", async () => {
    await agent.post('/api/auth').send({ username: 'TestAdmin', password: 'TestPassword123' });

    let { body } = await agent.get(questionApi);
    expect(body.length).toEqual(6);
    // Testes her fordi vi alligevel er logget ind.
    expect(body[0]).toHaveProperty('privateComments');
  });

  test("GET '/' -- should fail if not providing n and not admin", async () => {
    let { status, body } = await request(server).get(questionApi);
    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  test("POST '/' -- should fail because not admin", async () => {
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

    newQuestionId = body.id;

    expect(body.type).toEqual('NotAuthorized');
    expect(status).toEqual(403);
  });

  test("POST '/' -- should insert new question", async () => {
    let { body } = await agent.post(questionApi).send({
      text: 'Test',
      answer1: 'Svar 1',
      answer2: 'Svar 2',
      answer3: 'Svar 3',
      correctAnswers: [1],
      examSetId: 1,
      examSetQno: 5
    });

    newQuestionId = body.id;

    expect(body.text).toEqual('Test');
    expect(body.correctAnswers).toEqual([1]);
  });

  test("POST '/' -- should fail with invalid correct answer", async () => {
    let { status, body } = await agent.post(questionApi).send({
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

  test("POST '/' -- should fail with duplicated correct answers", async () => {
    let { status, body } = await agent.post(questionApi).send({
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

  test("POST '/search' -- should find results", async () => {
    let { body } = await request(server)
      .post(`${questionApi}/search`)
      .send({ searchString: 'læge psa' });

    expect(body).toHaveLength(3);
  });

  test("POST '/search' -- should not find results", async () => {
    let { body } = await request(server)
      .post(`${questionApi}/search`)
      .send({ searchString: 'ASDHASDhaksjdashdjkj' });

    expect(body).toHaveLength(0);
  });

  test("GET '/:id' -- should fetch one question", async () => {
    let { body } = await request(server).get(`${questionApi}/${firstQuestionId}`);

    expect(body.id).toEqual(firstQuestionId);
    expect(body).toHaveProperty('publicComments');
    expect(body.correctAnswers.length).toBeGreaterThan(0);
  });

  test("PATCH '/:id' -- should fail because not admin", async () => {
    let { status, body } = await request(server)
      .patch(`${questionApi}/${newQuestionId}`)
      .send({ text: 'Test af patch' });

    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  test("PATCH '/:id' -- should patch an existing question", async () => {
    let { body } = await agent
      .patch(`${questionApi}/${newQuestionId}`)
      .send({ text: 'Test af patch' });

    expect(body.text).toEqual('Test af patch');
    expect(body.id).toEqual(newQuestionId);
  });

  test("PUT '/:id/vote' -- should vote for a specialty", async () => {
    let { body } = await agent
      .put(`${questionApi}/${newQuestionId}/vote`)
      .send({ type: 'specialty', id: 1, value: 1 });

    expect(body.specialties[0].specialtyId).toEqual(1);
    expect(body.userSpecialtyVotes).toHaveLength(1);
  });

  test("PUT '/:id/vote' -- should delete votes when providing value = 'delete'", async () => {
    let { body } = await agent
      .put(`${questionApi}/${newQuestionId}/vote`)
      .send({ type: 'specialty', id: 1, value: 'delete' });

    expect(body.specialties).toHaveLength(0);
    expect(body.userSpecialtyVotes).toHaveLength(0);
  });

  test("PUT '/:id/vote' -- should fail if not logged in", async () => {
    let { status, body } = await request(server)
      .put(`${questionApi}/${newQuestionId}/vote`)
      .send({ specialtyVotes: [1] });

    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  test("POST '/:id/answer' -- WITHOUT auth -- should save an answer to the database", async () => {
    let { body } = await request(server)
      .post(`${questionApi}/${newQuestionId}/answer`)
      .send({ answer: 3 });

    expect(body.type).toEqual('QuestionAnswerSuccess');
    expect(body.data.question.id).toEqual(newQuestionId);
  });

  test("POST '/:id/answer' -- WITH auth -- should save an answer to the database", async () => {
    let { body } = await agent.post(`${questionApi}/${newQuestionId}/answer`).send({ answer: 2 });

    expect(body.type).toEqual('QuestionAnswerSuccess');
    expect(body.data.question.id).toEqual(newQuestionId);
  });

  test("POST '/:id/answer' -- should fail with invalid answer", async () => {
    let { status, body } = await request(server)
      .post(`${questionApi}/${newQuestionId}/answer`)
      .send({ answer: 'Forkert' });

    expect(status).toEqual(400);
    expect(body.type).toEqual('ModelValidation');
  });

  test("POST '/:id/bookmark' -- should insert a bookmark", async () => {
    let { status, body } = await agent.post(`${questionApi}/${newQuestionId}/bookmark`);

    expect(status).toEqual(200);
    expect(body.type).toEqual('QuestionBookmarkSuccess');
  });

  test("POST '/:id/bookmark' -- should fail because already bookmarked", async () => {
    let { status, body } = await agent.post(`${questionApi}/${newQuestionId}/bookmark`);

    expect(status).toEqual(409);
    expect(body.type).toEqual('UniqueViolation');
  });

  test("POST '/:id/bookmark' -- should fail because not logged in", async () => {
    let { status, body } = await request(server).post(`${questionApi}/${newQuestionId}/bookmark`);

    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  test("DELETE '/:id/bookmark' -- should delete a bookmark", async () => {
    let { status, body } = await agent.delete(`${questionApi}/${newQuestionId}/bookmark`);

    expect(status).toEqual(200);
    expect(body.type).toEqual('QuestionBookmarkDeleteSuccess');
  });

  test("POST '/:id/comment' -- should insert a comment", async () => {
    let { status, body } = await agent
      .post(`${questionApi}/${newQuestionId}/comment`)
      .send({ text: 'Dette er en test', isPrivate: false, isAnonymous: false });

    expect(status).toEqual(200);
    expect(body.publicComments).toHaveLength(1);
    expect(body.publicComments[0].text).toEqual('Dette er en test');

    newCommentId = body.publicComments[0].id;
  });

  test("POST '/:id/comment' -- should fail because not logged in", async () => {
    let { status, body } = await request(server).post(`${questionApi}/${newQuestionId}/comment`);

    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  test("PATCH '/:id/comment/:commentId' -- should patch a comment", async () => {
    let { status, body } = await agent
      .patch(`${questionApi}/${newQuestionId}/comment/${newCommentId}`)
      .send({
        text: 'opdateret text',
        isPrivate: false,
        isAnonymous: false
      });

    expect(status).toEqual(200);
    expect(body.publicComments[0].text).toEqual('opdateret text');
  });

  test("DELETE '/:id/comment/:commentId' -- should delete a comment", async () => {
    let { status, body } = await agent.delete(
      `${questionApi}/${newQuestionId}/comment/${newCommentId}`
    );

    expect(status).toEqual(200);
    expect(body.publicComments).toHaveLength(0);
  });

  test("DELETE '/:id' -- should fail because not admin", async () => {
    let { status, body } = await request(server).delete(`${questionApi}/${newQuestionId}`);
    expect(status).toEqual(403);
    expect(body.type).toEqual('NotAuthorized');
  });

  test("DELETE '/:id' -- should delete a question", async () => {
    let { body } = await agent.delete(`${questionApi}/${newQuestionId}`);

    expect(body.type).toEqual('deleteQuestion');
    expect(body.message).toEqual('Succesfully deleted 1 question');
  });
});
