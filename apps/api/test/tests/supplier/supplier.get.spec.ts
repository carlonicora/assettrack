import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { SUPPLIERS } from "test/data/fixtures/supplier";
import { testState } from "../../setup/test-state";

describe(`GET /${supplierMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Full.id}`).expect(403);
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId → 403 when supplier from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${supplierMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${supplierMeta.endpoint}`).expect(403);
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId → 200 returns supplier with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: supplierMeta.endpoint,
      expected: SUPPLIERS.CompanyOne_Full,
    });
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId → 200 returns supplier with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: supplierMeta.endpoint,
      expected: SUPPLIERS.CompanyOne_Nullable,
    });
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId → 200 returns supplier with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: supplierMeta.endpoint,
      expected: SUPPLIERS.CompanyOne_Minimal,
    });
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId → 404 when supplier does not exist`, async () => {
    const nonExistentSupplierId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${nonExistentSupplierId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${supplierMeta.endpoint} → 200 returns all suppliers for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(SUPPLIERS).filter((s) => s.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: supplierMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${supplierMeta.endpoint}?search=CompanyOne → 200 returns filtered suppliers`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: supplierMeta.endpoint,
      expected: [SUPPLIERS.CompanyOne_Full, SUPPLIERS.CompanyOne_Nullable, SUPPLIERS.CompanyOne_Minimal],
    });
  });

  it(`GET /${supplierMeta.endpoint}?search=Full → 200 returns filtered suppliers by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: supplierMeta.endpoint,
      expected: [SUPPLIERS.CompanyOne_Full],
    });
  });
});
