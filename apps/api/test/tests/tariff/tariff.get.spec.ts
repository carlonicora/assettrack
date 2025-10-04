import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { tariffMeta } from "src/features/tariff/entities/tariff.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { TARIFFS } from "test/data/fixtures/tariff";
import { testState } from "../../setup/test-state";

describe(`GET /${tariffMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${tariffMeta.endpoint}/:tariffId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${tariffMeta.endpoint}/:tariffId → 403 when tariff from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}/${TARIFFS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${tariffMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${tariffMeta.endpoint}`).expect(403);
  });

  it(`GET /${tariffMeta.endpoint}/:tariffId → 200 returns tariff with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: TARIFFS.CompanyOne_Full,
    });
  });

  it(`GET /${tariffMeta.endpoint}/:tariffId → 200 returns tariff with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: TARIFFS.CompanyOne_Nullable,
    });
  });

  it(`GET /${tariffMeta.endpoint}/:tariffId → 200 returns tariff with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: TARIFFS.CompanyOne_Minimal,
    });
  });

  it(`GET /${tariffMeta.endpoint}/:tariffId → 404 when tariff does not exist`, async () => {
    const nonExistentTariffId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}/${nonExistentTariffId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${tariffMeta.endpoint} → 200 returns all tariffs for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(TARIFFS).filter((t) => t.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${tariffMeta.endpoint}?search=CompanyOne → 200 returns filtered tariffs`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: [TARIFFS.CompanyOne_Full, TARIFFS.CompanyOne_Nullable, TARIFFS.CompanyOne_Minimal],
    });
  });

  it(`GET /${tariffMeta.endpoint}?search=Full → 200 returns filtered tariffs by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${tariffMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: [TARIFFS.CompanyOne_Full],
    });
  });


});