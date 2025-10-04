import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { documentMeta } from "src/features/document/entities/document.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { DOCUMENTS } from "test/data/fixtures/document";
import { USERS } from "test/data/fixtures/user";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { ownerMeta } from "src/foundations/user/entities/user.meta";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${documentMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${documentMeta.endpoint}/:documentId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${documentMeta.endpoint}/:documentId → 403 when document from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${documentMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${documentMeta.endpoint}`).expect(403);
  });

  it(`GET /${documentMeta.endpoint}/:documentId → 200 returns document with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: DOCUMENTS.CompanyOne_Full,
    });
  });

  it(`GET /${documentMeta.endpoint}/:documentId → 200 returns document with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: DOCUMENTS.CompanyOne_Nullable,
    });
  });

  it(`GET /${documentMeta.endpoint}/:documentId → 200 returns document with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: DOCUMENTS.CompanyOne_Minimal,
    });
  });

  it(`GET /${documentMeta.endpoint}/:documentId → 404 when document does not exist`, async () => {
    const nonExistentDocumentId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}/${nonExistentDocumentId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${documentMeta.endpoint} → 200 returns all documents for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(DOCUMENTS).filter((d) => d.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${documentMeta.endpoint}?search=CompanyOne → 200 returns filtered documents`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: [DOCUMENTS.CompanyOne_Full, DOCUMENTS.CompanyOne_Nullable, DOCUMENTS.CompanyOne_Minimal],
    });
  });

  it(`GET /${documentMeta.endpoint}?search=Full → 200 returns filtered documents by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${documentMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: [DOCUMENTS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${documentMeta.endpoint} → 200 returns documents by proceeding`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(DOCUMENTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.proceeding?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${documentMeta.endpoint} → 200 returns empty list when proceeding does not exist`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const nonExistentProceedingId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${nonExistentProceedingId}/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${documentMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${documentMeta.endpoint}?search=term → 200 returns filtered documents by proceeding and search`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(DOCUMENTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.proceeding?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // User relationship tests - conditional based on availability
  it(`GET /users/:userId/${documentMeta.endpoint} → 200 returns documents by user (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this user
    const expectedFixtures = Object.values(DOCUMENTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneUsers[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /users/:userId/${documentMeta.endpoint} → 403 when unauthenticated (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${documentMeta.endpoint}`)
      .expect(403);
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${ownerMeta.endpoint}/:ownerId/${documentMeta.endpoint} → 200 returns documents by owner`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(DOCUMENTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${documentMeta.endpoint} → 200 returns empty list when owner does not exist`, async () => {
    if (typeof USERS === 'undefined') return;

    const nonExistentOwnerId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${nonExistentOwnerId}/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${documentMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${documentMeta.endpoint}?search=term → 200 returns filtered documents by owner and search`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(DOCUMENTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // User relationship tests - conditional based on availability
  it(`GET /users/:userId/${documentMeta.endpoint} → 200 returns documents by user (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this user
    const expectedFixtures = Object.values(DOCUMENTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneUsers[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /users/:userId/${documentMeta.endpoint} → 403 when unauthenticated (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${documentMeta.endpoint}`)
      .expect(403);
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${userMeta.endpoint}/:userId/${documentMeta.endpoint} → 200 returns documents by user`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(DOCUMENTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${userMeta.endpoint}/:userId/${documentMeta.endpoint} → 200 returns empty list when user does not exist`, async () => {
    if (typeof USERS === 'undefined') return;

    const nonExistentUserId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${nonExistentUserId}/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${userMeta.endpoint}/:userId/${documentMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${userMeta.endpoint}/:userId/${documentMeta.endpoint}?search=term → 200 returns filtered documents by user and search`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${documentMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(DOCUMENTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});