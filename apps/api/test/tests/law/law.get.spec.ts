import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { lawMeta } from "src/features/law/entities/law.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { LAWS } from "test/data/fixtures/law";
import { DOCUMENTS } from "test/data/fixtures/document";
import { documentMeta } from "src/features/document/entities/document.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${lawMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${lawMeta.endpoint}/:lawId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${lawMeta.endpoint}/:lawId → 403 when law from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}/${LAWS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${lawMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${lawMeta.endpoint}`).expect(403);
  });

  it(`GET /${lawMeta.endpoint}/:lawId → 200 returns law with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: LAWS.CompanyOne_Full,
    });
  });

  it(`GET /${lawMeta.endpoint}/:lawId → 200 returns law with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: LAWS.CompanyOne_Nullable,
    });
  });

  it(`GET /${lawMeta.endpoint}/:lawId → 200 returns law with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: LAWS.CompanyOne_Minimal,
    });
  });

  it(`GET /${lawMeta.endpoint}/:lawId → 404 when law does not exist`, async () => {
    const nonExistentLawId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}/${nonExistentLawId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${lawMeta.endpoint} → 200 returns all laws for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(LAWS).filter((l) => l.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: lawMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${lawMeta.endpoint}?search=CompanyOne → 200 returns filtered laws`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: lawMeta.endpoint,
      expected: [LAWS.CompanyOne_Full, LAWS.CompanyOne_Nullable, LAWS.CompanyOne_Minimal],
    });
  });

  it(`GET /${lawMeta.endpoint}?search=Full → 200 returns filtered laws by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${lawMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: lawMeta.endpoint,
      expected: [LAWS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${documentMeta.endpoint}/:documentId/${lawMeta.endpoint} → 200 returns laws by document`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof DOCUMENTS === 'undefined') return;

    const companyOneFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${companyOneFixtures[0].id}/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(LAWS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.documents?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: lawMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${documentMeta.endpoint}/:documentId/${lawMeta.endpoint} → 200 returns empty list when document does not exist`, async () => {
    if (typeof DOCUMENTS === 'undefined') return;

    const nonExistentDocumentId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${nonExistentDocumentId}/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${documentMeta.endpoint}/:documentId/${lawMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof DOCUMENTS === 'undefined') return;

    const companyOneFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${companyOneFixtures[0].id}/${lawMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${documentMeta.endpoint}/:documentId/${lawMeta.endpoint}?search=term → 200 returns filtered laws by document and search`, async () => {
    if (typeof DOCUMENTS === 'undefined') return;

    const companyOneFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${companyOneFixtures[0].id}/${lawMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(LAWS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.documents?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: lawMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});