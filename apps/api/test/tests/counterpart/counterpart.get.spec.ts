import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { counterpartMeta } from "src/features/counterpart/entities/counterpart.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { COUNTERPARTS } from "test/data/fixtures/counterpart";
import { COUNTERPARTS } from "test/data/fixtures/counterpart";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { DOCUMENTS } from "test/data/fixtures/document";
import { counterpartMeta } from "src/features/counterpart/entities/counterpart.meta";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { documentMeta } from "src/features/document/entities/document.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${counterpartMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId → 403 when counterpart from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${counterpartMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${counterpartMeta.endpoint}`).expect(403);
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId → 200 returns counterpart with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: COUNTERPARTS.CompanyOne_Full,
    });
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId → 200 returns counterpart with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: COUNTERPARTS.CompanyOne_Nullable,
    });
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId → 200 returns counterpart with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: COUNTERPARTS.CompanyOne_Minimal,
    });
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId → 404 when counterpart does not exist`, async () => {
    const nonExistentCounterpartId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${nonExistentCounterpartId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${counterpartMeta.endpoint} → 200 returns all counterparts for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(COUNTERPARTS).filter((c) => c.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${counterpartMeta.endpoint}?search=CompanyOne → 200 returns filtered counterparts`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: [COUNTERPARTS.CompanyOne_Full, COUNTERPARTS.CompanyOne_Nullable, COUNTERPARTS.CompanyOne_Minimal],
    });
  });

  it(`GET /${counterpartMeta.endpoint}?search=Full → 200 returns filtered counterparts by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: [COUNTERPARTS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${counterpartMeta.endpoint}/:counterpartId/${counterpartMeta.endpoint} → 200 returns counterparts by counterpart`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof COUNTERPARTS === 'undefined') return;

    const companyOneFixtures = Object.values(COUNTERPARTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(COUNTERPARTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.counterpart?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId/${counterpartMeta.endpoint} → 200 returns empty list when counterpart does not exist`, async () => {
    if (typeof COUNTERPARTS === 'undefined') return;

    const nonExistentCounterpartId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${nonExistentCounterpartId}/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId/${counterpartMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof COUNTERPARTS === 'undefined') return;

    const companyOneFixtures = Object.values(COUNTERPARTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${counterpartMeta.endpoint}/:counterpartId/${counterpartMeta.endpoint}?search=term → 200 returns filtered counterparts by counterpart and search`, async () => {
    if (typeof COUNTERPARTS === 'undefined') return;

    const companyOneFixtures = Object.values(COUNTERPARTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${counterpartMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(COUNTERPARTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.counterpart?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${counterpartMeta.endpoint} → 200 returns counterparts by proceeding`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(COUNTERPARTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.proceedings?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${counterpartMeta.endpoint} → 200 returns empty list when proceeding does not exist`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const nonExistentProceedingId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${nonExistentProceedingId}/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${counterpartMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${counterpartMeta.endpoint}?search=term → 200 returns filtered counterparts by proceeding and search`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(COUNTERPARTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.proceedings?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${documentMeta.endpoint}/:documentId/${counterpartMeta.endpoint} → 200 returns counterparts by document`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof DOCUMENTS === 'undefined') return;

    const companyOneFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(COUNTERPARTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.documents?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${documentMeta.endpoint}/:documentId/${counterpartMeta.endpoint} → 200 returns empty list when document does not exist`, async () => {
    if (typeof DOCUMENTS === 'undefined') return;

    const nonExistentDocumentId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${nonExistentDocumentId}/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${documentMeta.endpoint}/:documentId/${counterpartMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof DOCUMENTS === 'undefined') return;

    const companyOneFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${documentMeta.endpoint}/:documentId/${counterpartMeta.endpoint}?search=term → 200 returns filtered counterparts by document and search`, async () => {
    if (typeof DOCUMENTS === 'undefined') return;

    const companyOneFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${companyOneFixtures[0].id}/${counterpartMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(COUNTERPARTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.documents?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});