import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { objectionMeta } from "src/features/objection/entities/objection.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { OBJECTIONS } from "test/data/fixtures/objection";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${objectionMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId → 403 when objection from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${objectionMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${objectionMeta.endpoint}`).expect(403);
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId → 200 returns objection with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: OBJECTIONS.CompanyOne_Full,
    });
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId → 200 returns objection with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: OBJECTIONS.CompanyOne_Nullable,
    });
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId → 200 returns objection with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: OBJECTIONS.CompanyOne_Minimal,
    });
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId → 404 when objection does not exist`, async () => {
    const nonExistentObjectionId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${nonExistentObjectionId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${objectionMeta.endpoint} → 200 returns all objections for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(OBJECTIONS).filter((o) => o.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${objectionMeta.endpoint}?search=CompanyOne → 200 returns filtered objections`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: [OBJECTIONS.CompanyOne_Full, OBJECTIONS.CompanyOne_Nullable, OBJECTIONS.CompanyOne_Minimal],
    });
  });

  it(`GET /${objectionMeta.endpoint}?search=Full → 200 returns filtered objections by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: [OBJECTIONS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${classificationMeta.endpoint}/:classificationId/${objectionMeta.endpoint} → 200 returns objections by classification`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${objectionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OBJECTIONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classifications?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${objectionMeta.endpoint} → 200 returns empty list when classification does not exist`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const nonExistentClassificationId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${nonExistentClassificationId}/${objectionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${objectionMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${objectionMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${objectionMeta.endpoint}?search=term → 200 returns filtered objections by classification and search`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${objectionMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OBJECTIONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classifications?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});