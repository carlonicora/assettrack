import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { questionMeta } from "src/features/question/entities/question.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { QUESTIONS } from "test/data/fixtures/question";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${questionMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${questionMeta.endpoint}/:questionId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${QUESTIONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${questionMeta.endpoint}/:questionId → 403 when question from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${QUESTIONS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${questionMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${questionMeta.endpoint}`).expect(403);
  });

  it(`GET /${questionMeta.endpoint}/:questionId → 200 returns question with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${QUESTIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: questionMeta.endpoint,
      expected: QUESTIONS.CompanyOne_Full,
    });
  });

  it(`GET /${questionMeta.endpoint}/:questionId → 200 returns question with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${QUESTIONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: questionMeta.endpoint,
      expected: QUESTIONS.CompanyOne_Nullable,
    });
  });

  it(`GET /${questionMeta.endpoint}/:questionId → 200 returns question with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${QUESTIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: questionMeta.endpoint,
      expected: QUESTIONS.CompanyOne_Minimal,
    });
  });

  it(`GET /${questionMeta.endpoint}/:questionId → 404 when question does not exist`, async () => {
    const nonExistentQuestionId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}/${nonExistentQuestionId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${questionMeta.endpoint} → 200 returns all questions for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(QUESTIONS).filter((q) => q.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: questionMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${questionMeta.endpoint}?search=CompanyOne → 200 returns filtered questions`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: questionMeta.endpoint,
      expected: [QUESTIONS.CompanyOne_Full, QUESTIONS.CompanyOne_Nullable, QUESTIONS.CompanyOne_Minimal],
    });
  });

  it(`GET /${questionMeta.endpoint}?search=Full → 200 returns filtered questions by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${questionMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: questionMeta.endpoint,
      expected: [QUESTIONS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${classificationMeta.endpoint}/:classificationId/${questionMeta.endpoint} → 200 returns questions by classification`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(QUESTIONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classifications?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: questionMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${questionMeta.endpoint} → 200 returns empty list when classification does not exist`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const nonExistentClassificationId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${nonExistentClassificationId}/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${questionMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${questionMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${questionMeta.endpoint}?search=term → 200 returns filtered questions by classification and search`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${questionMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(QUESTIONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classifications?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: questionMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});