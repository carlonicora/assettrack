import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { accountMeta } from "src/features/account/entities/account.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { ACCOUNTS } from "test/data/fixtures/account";
import { USERS } from "test/data/fixtures/user";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { ownerMeta } from "src/foundations/user/entities/user.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${accountMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${accountMeta.endpoint}/:accountId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${accountMeta.endpoint}/:accountId → 403 when account from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${accountMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${accountMeta.endpoint}`).expect(403);
  });

  it(`GET /${accountMeta.endpoint}/:accountId → 200 returns account with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: ACCOUNTS.CompanyOne_Full,
    });
  });

  it(`GET /${accountMeta.endpoint}/:accountId → 200 returns account with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: ACCOUNTS.CompanyOne_Nullable,
    });
  });

  it(`GET /${accountMeta.endpoint}/:accountId → 200 returns account with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: ACCOUNTS.CompanyOne_Minimal,
    });
  });

  it(`GET /${accountMeta.endpoint}/:accountId → 404 when account does not exist`, async () => {
    const nonExistentAccountId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${nonExistentAccountId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${accountMeta.endpoint} → 200 returns all accounts for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(ACCOUNTS).filter((a) => a.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${accountMeta.endpoint}?search=CompanyOne → 200 returns filtered accounts`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: [ACCOUNTS.CompanyOne_Full, ACCOUNTS.CompanyOne_Nullable, ACCOUNTS.CompanyOne_Minimal],
    });
  });

  it(`GET /${accountMeta.endpoint}?search=Full → 200 returns filtered accounts by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: [ACCOUNTS.CompanyOne_Full],
    });
  });


  // User relationship tests - conditional based on availability
  it(`GET /users/:userId/${accountMeta.endpoint} → 200 returns accounts by user (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this user
    const expectedFixtures = Object.values(ACCOUNTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneUsers[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /users/:userId/${accountMeta.endpoint} → 403 when unauthenticated (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${accountMeta.endpoint}`)
      .expect(403);
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${userMeta.endpoint}/:userId/${accountMeta.endpoint} → 200 returns accounts by user`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(ACCOUNTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${userMeta.endpoint}/:userId/${accountMeta.endpoint} → 200 returns empty list when user does not exist`, async () => {
    if (typeof USERS === 'undefined') return;

    const nonExistentUserId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${nonExistentUserId}/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${userMeta.endpoint}/:userId/${accountMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${accountMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${userMeta.endpoint}/:userId/${accountMeta.endpoint}?search=term → 200 returns filtered accounts by user and search`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${accountMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(ACCOUNTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // User relationship tests - conditional based on availability
  it(`GET /users/:userId/${accountMeta.endpoint} → 200 returns accounts by user (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this user
    const expectedFixtures = Object.values(ACCOUNTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneUsers[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /users/:userId/${accountMeta.endpoint} → 403 when unauthenticated (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${accountMeta.endpoint}`)
      .expect(403);
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${ownerMeta.endpoint}/:ownerId/${accountMeta.endpoint} → 200 returns accounts by owner`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(ACCOUNTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${accountMeta.endpoint} → 200 returns empty list when owner does not exist`, async () => {
    if (typeof USERS === 'undefined') return;

    const nonExistentOwnerId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${nonExistentOwnerId}/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${accountMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${accountMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${accountMeta.endpoint}?search=term → 200 returns filtered accounts by owner and search`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${accountMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(ACCOUNTS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});