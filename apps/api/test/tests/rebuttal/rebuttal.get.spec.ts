import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { rebuttalMeta } from "src/features/rebuttal/entities/rebuttal.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { REBUTTALS } from "test/data/fixtures/rebuttal";
import { OBJECTIONS } from "test/data/fixtures/objection";
import { objectionMeta } from "src/features/objection/entities/objection.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${rebuttalMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId → 403 when rebuttal from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${rebuttalMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${rebuttalMeta.endpoint}`).expect(403);
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId → 200 returns rebuttal with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: REBUTTALS.CompanyOne_Full,
    });
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId → 200 returns rebuttal with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: REBUTTALS.CompanyOne_Nullable,
    });
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId → 200 returns rebuttal with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: REBUTTALS.CompanyOne_Minimal,
    });
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId → 404 when rebuttal does not exist`, async () => {
    const nonExistentRebuttalId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${nonExistentRebuttalId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${rebuttalMeta.endpoint} → 200 returns all rebuttals for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(REBUTTALS).filter((r) => r.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${rebuttalMeta.endpoint}?search=CompanyOne → 200 returns filtered rebuttals`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: [REBUTTALS.CompanyOne_Full, REBUTTALS.CompanyOne_Nullable, REBUTTALS.CompanyOne_Minimal],
    });
  });

  it(`GET /${rebuttalMeta.endpoint}?search=Full → 200 returns filtered rebuttals by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: [REBUTTALS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${objectionMeta.endpoint}/:objectionId/${rebuttalMeta.endpoint} → 200 returns rebuttals by objection`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof OBJECTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${companyOneFixtures[0].id}/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(REBUTTALS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.objection?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId/${rebuttalMeta.endpoint} → 200 returns empty list when objection does not exist`, async () => {
    if (typeof OBJECTIONS === 'undefined') return;

    const nonExistentObjectionId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${nonExistentObjectionId}/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId/${rebuttalMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof OBJECTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${companyOneFixtures[0].id}/${rebuttalMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId/${rebuttalMeta.endpoint}?search=term → 200 returns filtered rebuttals by objection and search`, async () => {
    if (typeof OBJECTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${companyOneFixtures[0].id}/${rebuttalMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(REBUTTALS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.objection?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});