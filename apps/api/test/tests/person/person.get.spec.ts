import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { personMeta } from "src/features/person/entities/person.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { PERSONS } from "test/data/fixtures/person";
import { USERS } from "test/data/fixtures/user";
import { ACCOUNTS } from "test/data/fixtures/account";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { ownerMeta } from "src/foundations/user/entities/user.meta";
import { accountMeta } from "src/features/account/entities/account.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${personMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${personMeta.endpoint}/:personId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${personMeta.endpoint}/:personId → 403 when person from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${PERSONS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${personMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${personMeta.endpoint}`).expect(403);
  });

  it(`GET /${personMeta.endpoint}/:personId → 200 returns person with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: PERSONS.CompanyOne_Full,
    });
  });

  it(`GET /${personMeta.endpoint}/:personId → 200 returns person with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: PERSONS.CompanyOne_Nullable,
    });
  });

  it(`GET /${personMeta.endpoint}/:personId → 200 returns person with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: PERSONS.CompanyOne_Minimal,
    });
  });

  it(`GET /${personMeta.endpoint}/:personId → 404 when person does not exist`, async () => {
    const nonExistentPersonId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${nonExistentPersonId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${personMeta.endpoint} → 200 returns all persons for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(PERSONS).filter((p) => p.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${personMeta.endpoint}?search=CompanyOne → 200 returns filtered persons`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: [PERSONS.CompanyOne_Full, PERSONS.CompanyOne_Nullable, PERSONS.CompanyOne_Minimal],
    });
  });

  it(`GET /${personMeta.endpoint}?search=Full → 200 returns filtered persons by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: [PERSONS.CompanyOne_Full],
    });
  });


  // User relationship tests - conditional based on availability
  it(`GET /users/:userId/${personMeta.endpoint} → 200 returns persons by user (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this user
    const expectedFixtures = Object.values(PERSONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneUsers[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /users/:userId/${personMeta.endpoint} → 403 when unauthenticated (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${personMeta.endpoint}`)
      .expect(403);
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${userMeta.endpoint}/:userId/${personMeta.endpoint} → 200 returns persons by user`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PERSONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${userMeta.endpoint}/:userId/${personMeta.endpoint} → 200 returns empty list when user does not exist`, async () => {
    if (typeof USERS === 'undefined') return;

    const nonExistentUserId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${nonExistentUserId}/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${userMeta.endpoint}/:userId/${personMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${userMeta.endpoint}/:userId/${personMeta.endpoint}?search=term → 200 returns filtered persons by user and search`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${userMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PERSONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.users?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // User relationship tests - conditional based on availability
  it(`GET /users/:userId/${personMeta.endpoint} → 200 returns persons by user (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this user
    const expectedFixtures = Object.values(PERSONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneUsers[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /users/:userId/${personMeta.endpoint} → 403 when unauthenticated (if user endpoints available)`, async () => {
    const companyOneUsers = Object.values(USERS).filter(u => u.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneUsers.length === 0) return;

    await request(app.getHttpServer())
      .get(`/users/${companyOneUsers[0].id}/${personMeta.endpoint}`)
      .expect(403);
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${ownerMeta.endpoint}/:ownerId/${personMeta.endpoint} → 200 returns persons by owner`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PERSONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${personMeta.endpoint} → 200 returns empty list when owner does not exist`, async () => {
    if (typeof USERS === 'undefined') return;

    const nonExistentOwnerId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${nonExistentOwnerId}/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${personMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${ownerMeta.endpoint}/:ownerId/${personMeta.endpoint}?search=term → 200 returns filtered persons by owner and search`, async () => {
    if (typeof USERS === 'undefined') return;

    const companyOneFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${ownerMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PERSONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.owner?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${accountMeta.endpoint}/:accountId/${personMeta.endpoint} → 200 returns persons by account`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PERSONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.account?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${personMeta.endpoint} → 200 returns empty list when account does not exist`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const nonExistentAccountId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${nonExistentAccountId}/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${personMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${personMeta.endpoint}?search=term → 200 returns filtered persons by account and search`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${personMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PERSONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.account?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});