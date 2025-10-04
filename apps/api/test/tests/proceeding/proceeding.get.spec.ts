import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { USERS } from "test/data/fixtures/user";
import { ACCOUNTS } from "test/data/fixtures/account";
import { PERSONS } from "test/data/fixtures/person";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { ownerMeta } from "src/foundations/user/entities/user.meta";
import { accountMeta } from "src/features/account/entities/account.meta";
import { personMeta } from "src/features/person/entities/person.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${proceedingMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId → 403 when proceeding from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${proceedingMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${proceedingMeta.endpoint}`).expect(403);
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId → 200 returns proceeding with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: PROCEEDINGS.CompanyOne_Full,
    });
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId → 200 returns proceeding with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: PROCEEDINGS.CompanyOne_Nullable,
    });
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId → 200 returns proceeding with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: PROCEEDINGS.CompanyOne_Minimal,
    });
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId → 404 when proceeding does not exist`, async () => {
    const nonExistentProceedingId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${nonExistentProceedingId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${proceedingMeta.endpoint} → 200 returns all proceedings for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(PROCEEDINGS).filter((p) => p.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${proceedingMeta.endpoint}?search=CompanyOne → 200 returns filtered proceedings`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: [PROCEEDINGS.CompanyOne_Full, PROCEEDINGS.CompanyOne_Nullable, PROCEEDINGS.CompanyOne_Minimal],
    });
  });

  it(`GET /${proceedingMeta.endpoint}?search=Full → 200 returns filtered proceedings by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: [PROCEEDINGS.CompanyOne_Full],
    });
  });


  // User relationship tests - conditional based on availability
  it(`GET /users/:userId/${proceedingMeta.endpoint} → 200 returns proceedings by user (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this user
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneUsers[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /users/:userId/${proceedingMeta.endpoint} → 403 when unauthenticated (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${proceedingMeta.endpoint}`)
      .expect(403);
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${userMeta.endpoint}/:userId/${proceedingMeta.endpoint} → 200 returns proceedings by user`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${userMeta.endpoint}/:userId/${proceedingMeta.endpoint} → 200 returns empty list when user does not exist`, async () => {
    if (typeof USERS === 'undefined') return;

    const nonExistentUserId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${nonExistentUserId}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${userMeta.endpoint}/:userId/${proceedingMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${userMeta.endpoint}/:userId/${proceedingMeta.endpoint}?search=term → 200 returns filtered proceedings by user and search`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // User relationship tests - conditional based on availability
  it(`GET /users/:userId/${proceedingMeta.endpoint} → 200 returns proceedings by user (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this user
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneUsers[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /users/:userId/${proceedingMeta.endpoint} → 403 when unauthenticated (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${proceedingMeta.endpoint}`)
      .expect(403);
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${ownerMeta.endpoint}/:ownerId/${proceedingMeta.endpoint} → 200 returns proceedings by owner`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${proceedingMeta.endpoint} → 200 returns empty list when owner does not exist`, async () => {
    if (typeof USERS === 'undefined') return;

    const nonExistentOwnerId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${nonExistentOwnerId}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${proceedingMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${proceedingMeta.endpoint}?search=term → 200 returns filtered proceedings by owner and search`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${accountMeta.endpoint}/:accountId/${proceedingMeta.endpoint} → 200 returns proceedings by account`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.accounts?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${proceedingMeta.endpoint} → 200 returns empty list when account does not exist`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const nonExistentAccountId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${nonExistentAccountId}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${proceedingMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${proceedingMeta.endpoint}?search=term → 200 returns filtered proceedings by account and search`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.accounts?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${personMeta.endpoint}/:personId/${proceedingMeta.endpoint} → 200 returns proceedings by person`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PERSONS === 'undefined') return;

    const companyOneFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.persons?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${personMeta.endpoint}/:personId/${proceedingMeta.endpoint} → 200 returns empty list when person does not exist`, async () => {
    if (typeof PERSONS === 'undefined') return;

    const nonExistentPersonId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${nonExistentPersonId}/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${personMeta.endpoint}/:personId/${proceedingMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PERSONS === 'undefined') return;

    const companyOneFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${personMeta.endpoint}/:personId/${proceedingMeta.endpoint}?search=term → 200 returns filtered proceedings by person and search`, async () => {
    if (typeof PERSONS === 'undefined') return;

    const companyOneFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${companyOneFixtures[0].id}/${proceedingMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PROCEEDINGS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.persons?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});