import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { propositionMeta } from "src/features/proposition/entities/proposition.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { PROPOSITIONS } from "test/data/fixtures/proposition";
import { PAINS } from "test/data/fixtures/pain";
import { painMeta } from "src/features/pain/entities/pain.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${propositionMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${propositionMeta.endpoint}/:propositionId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}/${PROPOSITIONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${propositionMeta.endpoint}/:propositionId → 403 when proposition from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}/${PROPOSITIONS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${propositionMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${propositionMeta.endpoint}`).expect(403);
  });

  it(`GET /${propositionMeta.endpoint}/:propositionId → 200 returns proposition with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}/${PROPOSITIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: PROPOSITIONS.CompanyOne_Full,
    });
  });

  it(`GET /${propositionMeta.endpoint}/:propositionId → 200 returns proposition with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}/${PROPOSITIONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: PROPOSITIONS.CompanyOne_Nullable,
    });
  });

  it(`GET /${propositionMeta.endpoint}/:propositionId → 200 returns proposition with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}/${PROPOSITIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: PROPOSITIONS.CompanyOne_Minimal,
    });
  });

  it(`GET /${propositionMeta.endpoint}/:propositionId → 404 when proposition does not exist`, async () => {
    const nonExistentPropositionId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}/${nonExistentPropositionId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${propositionMeta.endpoint} → 200 returns all propositions for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(PROPOSITIONS).filter((p) => p.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${propositionMeta.endpoint}?search=CompanyOne → 200 returns filtered propositions`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: [PROPOSITIONS.CompanyOne_Full, PROPOSITIONS.CompanyOne_Nullable, PROPOSITIONS.CompanyOne_Minimal],
    });
  });

  it(`GET /${propositionMeta.endpoint}?search=Full → 200 returns filtered propositions by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${propositionMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: [PROPOSITIONS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${painMeta.endpoint}/:painId/${propositionMeta.endpoint} → 200 returns propositions by pain`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(PROPOSITIONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.pains?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${painMeta.endpoint}/:painId/${propositionMeta.endpoint} → 200 returns empty list when pain does not exist`, async () => {
    if (typeof PAINS === 'undefined') return;

    const nonExistentPainId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${nonExistentPainId}/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${painMeta.endpoint}/:painId/${propositionMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${propositionMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${painMeta.endpoint}/:painId/${propositionMeta.endpoint}?search=term → 200 returns filtered propositions by pain and search`, async () => {
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${propositionMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(PROPOSITIONS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.pains?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});