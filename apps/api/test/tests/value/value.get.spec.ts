import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { valueMeta } from "src/features/value/entities/value.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { VALUES } from "test/data/fixtures/value";
import { PAINS } from "test/data/fixtures/pain";
import { painMeta } from "src/features/pain/entities/pain.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${valueMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${valueMeta.endpoint}/:valueId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${valueMeta.endpoint}/:valueId → 403 when value from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${VALUES.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${valueMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${valueMeta.endpoint}`).expect(403);
  });

  it(`GET /${valueMeta.endpoint}/:valueId → 200 returns value with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: valueMeta.endpoint,
      expected: VALUES.CompanyOne_Full,
    });
  });

  it(`GET /${valueMeta.endpoint}/:valueId → 200 returns value with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: valueMeta.endpoint,
      expected: VALUES.CompanyOne_Nullable,
    });
  });

  it(`GET /${valueMeta.endpoint}/:valueId → 200 returns value with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: valueMeta.endpoint,
      expected: VALUES.CompanyOne_Minimal,
    });
  });

  it(`GET /${valueMeta.endpoint}/:valueId → 404 when value does not exist`, async () => {
    const nonExistentValueId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${nonExistentValueId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${valueMeta.endpoint} → 200 returns all values for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(VALUES).filter((v) => v.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: valueMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${valueMeta.endpoint}?search=CompanyOne → 200 returns filtered values`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: valueMeta.endpoint,
      expected: [VALUES.CompanyOne_Full, VALUES.CompanyOne_Nullable, VALUES.CompanyOne_Minimal],
    });
  });

  it(`GET /${valueMeta.endpoint}?search=Full → 200 returns filtered values by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: valueMeta.endpoint,
      expected: [VALUES.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${painMeta.endpoint}/:painId/${valueMeta.endpoint} → 200 returns values by pain`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(VALUES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.pain?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: valueMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${painMeta.endpoint}/:painId/${valueMeta.endpoint} → 200 returns empty list when pain does not exist`, async () => {
    if (typeof PAINS === 'undefined') return;

    const nonExistentPainId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${nonExistentPainId}/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${painMeta.endpoint}/:painId/${valueMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${valueMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${painMeta.endpoint}/:painId/${valueMeta.endpoint}?search=term → 200 returns filtered values by pain and search`, async () => {
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${valueMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(VALUES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.pain?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: valueMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});