import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { analyticMeta } from "src/features/analytic/entities/analytic.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { ANALYTICS } from "test/data/fixtures/analytic";
import { testState } from "../../setup/test-state";

describe(`GET /${analyticMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${analyticMeta.endpoint}/:analyticId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${analyticMeta.endpoint}/${ANALYTICS.CompanyOne_Full.id}`).expect(403);
  });

  it(`GET /${analyticMeta.endpoint}/:analyticId → 403 when analytic from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${analyticMeta.endpoint}/${ANALYTICS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${analyticMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${analyticMeta.endpoint}`).expect(403);
  });

  it(`GET /${analyticMeta.endpoint}/:analyticId → 200 returns analytic with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${analyticMeta.endpoint}/${ANALYTICS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: analyticMeta.endpoint,
      expected: ANALYTICS.CompanyOne_Full,
    });
  });

  it(`GET /${analyticMeta.endpoint}/:analyticId → 200 returns analytic with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${analyticMeta.endpoint}/${ANALYTICS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: analyticMeta.endpoint,
      expected: ANALYTICS.CompanyOne_Nullable,
    });
  });

  it(`GET /${analyticMeta.endpoint}/:analyticId → 200 returns analytic with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${analyticMeta.endpoint}/${ANALYTICS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: analyticMeta.endpoint,
      expected: ANALYTICS.CompanyOne_Minimal,
    });
  });

  it(`GET /${analyticMeta.endpoint}/:analyticId → 404 when analytic does not exist`, async () => {
    const nonExistentAnalyticId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${analyticMeta.endpoint}/${nonExistentAnalyticId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${analyticMeta.endpoint} → 200 returns all analytics for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${analyticMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(ANALYTICS).filter((a) => a.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: analyticMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${analyticMeta.endpoint}?search=CompanyOne → 200 returns filtered analytics`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${analyticMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: analyticMeta.endpoint,
      expected: [ANALYTICS.CompanyOne_Full, ANALYTICS.CompanyOne_Nullable, ANALYTICS.CompanyOne_Minimal],
    });
  });

  it(`GET /${analyticMeta.endpoint}?search=Full → 200 returns filtered analytics by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${analyticMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: analyticMeta.endpoint,
      expected: [ANALYTICS.CompanyOne_Full],
    });
  });
});
