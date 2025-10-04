import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { painMeta } from "src/features/pain/entities/pain.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { PAINS } from "test/data/fixtures/pain";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${painMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${painMeta.endpoint}/:painId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${PAINS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${painMeta.endpoint}/:painId → 403 when pain from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${PAINS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${painMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${painMeta.endpoint}`).expect(403);
  });

  it(`GET /${painMeta.endpoint}/:painId → 200 returns pain with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${PAINS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: painMeta.endpoint,
      expected: PAINS.CompanyOne_Full,
    });
  });

  it(`GET /${painMeta.endpoint}/:painId → 200 returns pain with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${PAINS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: painMeta.endpoint,
      expected: PAINS.CompanyOne_Nullable,
    });
  });

  it(`GET /${painMeta.endpoint}/:painId → 200 returns pain with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${PAINS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: painMeta.endpoint,
      expected: PAINS.CompanyOne_Minimal,
    });
  });

  it(`GET /${painMeta.endpoint}/:painId → 404 when pain does not exist`, async () => {
    const nonExistentPainId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${nonExistentPainId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${painMeta.endpoint} → 200 returns all pains for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(PAINS).filter((p) => p.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: painMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${painMeta.endpoint}?search=CompanyOne → 200 returns filtered pains`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: painMeta.endpoint,
      expected: [PAINS.CompanyOne_Full, PAINS.CompanyOne_Nullable, PAINS.CompanyOne_Minimal],
    });
  });

  it(`GET /${painMeta.endpoint}?search=Full → 200 returns filtered pains by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: painMeta.endpoint,
      expected: [PAINS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${classificationMeta.endpoint}/:classificationId/${painMeta.endpoint} → 200 returns pains by classification`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${painMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PAINS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classifications?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: painMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${painMeta.endpoint} → 200 returns empty list when classification does not exist`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const nonExistentClassificationId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${nonExistentClassificationId}/${painMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${painMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${painMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${painMeta.endpoint}?search=term → 200 returns filtered pains by classification and search`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${painMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PAINS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classifications?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: painMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});