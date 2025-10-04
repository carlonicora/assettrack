import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { answerMeta } from "src/features/answer/entities/answer.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { ANSWERS } from "test/data/fixtures/answer";
import { QUESTIONS } from "test/data/fixtures/question";
import { questionMeta } from "src/features/question/entities/question.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${answerMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${answerMeta.endpoint}/:answerId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${answerMeta.endpoint}/:answerId → 403 when answer from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${ANSWERS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${answerMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${answerMeta.endpoint}`).expect(403);
  });

  it(`GET /${answerMeta.endpoint}/:answerId → 200 returns answer with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: answerMeta.endpoint,
      expected: ANSWERS.CompanyOne_Full,
    });
  });

  it(`GET /${answerMeta.endpoint}/:answerId → 200 returns answer with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: answerMeta.endpoint,
      expected: ANSWERS.CompanyOne_Nullable,
    });
  });

  it(`GET /${answerMeta.endpoint}/:answerId → 200 returns answer with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: answerMeta.endpoint,
      expected: ANSWERS.CompanyOne_Minimal,
    });
  });

  it(`GET /${answerMeta.endpoint}/:answerId → 404 when answer does not exist`, async () => {
    const nonExistentAnswerId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${nonExistentAnswerId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${answerMeta.endpoint} → 200 returns all answers for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(ANSWERS).filter((a) => a.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: answerMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${answerMeta.endpoint}?search=CompanyOne → 200 returns filtered answers`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: answerMeta.endpoint,
      expected: [ANSWERS.CompanyOne_Full, ANSWERS.CompanyOne_Nullable, ANSWERS.CompanyOne_Minimal],
    });
  });

  it(`GET /${answerMeta.endpoint}?search=Full → 200 returns filtered answers by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: answerMeta.endpoint,
      expected: [ANSWERS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${questionMeta.endpoint}/:questionId/${answerMeta.endpoint} → 200 returns answers by question`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof QUESTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(QUESTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${companyOneFixtures[0].id}/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(ANSWERS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.question?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: answerMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${questionMeta.endpoint}/:questionId/${answerMeta.endpoint} → 200 returns empty list when question does not exist`, async () => {
    if (typeof QUESTIONS === 'undefined') return;

    const nonExistentQuestionId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${nonExistentQuestionId}/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${questionMeta.endpoint}/:questionId/${answerMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof QUESTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(QUESTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${companyOneFixtures[0].id}/${answerMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${questionMeta.endpoint}/:questionId/${answerMeta.endpoint}?search=term → 200 returns filtered answers by question and search`, async () => {
    if (typeof QUESTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(QUESTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${companyOneFixtures[0].id}/${answerMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(ANSWERS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.question?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: answerMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});