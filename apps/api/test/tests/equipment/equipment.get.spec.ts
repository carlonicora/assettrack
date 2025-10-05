import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { EQUIPMENTS } from "test/data/fixtures/equipment";
import { SUPPLIERS } from "test/data/fixtures/supplier";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${equipmentMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Full.id}`).expect(403);
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId → 403 when equipment from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${equipmentMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${equipmentMeta.endpoint}`).expect(403);
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId → 200 returns equipment with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: EQUIPMENTS.CompanyOne_Full,
    });
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId → 200 returns equipment with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: EQUIPMENTS.CompanyOne_Nullable,
    });
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId → 200 returns equipment with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: EQUIPMENTS.CompanyOne_Minimal,
    });
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId → 404 when equipment does not exist`, async () => {
    const nonExistentEquipmentId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${nonExistentEquipmentId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${equipmentMeta.endpoint} → 200 returns all equipments for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(EQUIPMENTS).filter((e) => e.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${equipmentMeta.endpoint}?search=CompanyOne → 200 returns filtered equipments`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: [EQUIPMENTS.CompanyOne_Full, EQUIPMENTS.CompanyOne_Nullable, EQUIPMENTS.CompanyOne_Minimal],
    });
  });

  it(`GET /${equipmentMeta.endpoint}?search=Full → 200 returns filtered equipments by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: [EQUIPMENTS.CompanyOne_Full],
    });
  });

  // Other relationship tests - only if fixtures exist
  it(`GET /${supplierMeta.endpoint}/:supplierId/${equipmentMeta.endpoint} → 200 returns equipments by supplier`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof SUPPLIERS === "undefined") return;

    const companyOneFixtures = Object.values(SUPPLIERS).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${companyOneFixtures[0].id}/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(EQUIPMENTS).filter(
      (f) => f.company.id === COMPANIES.CompanyOne.id && f.supplier?.id === companyOneFixtures[0].id,
    );
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId/${equipmentMeta.endpoint} → 200 returns empty list when supplier does not exist`, async () => {
    if (typeof SUPPLIERS === "undefined") return;

    const nonExistentSupplierId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${nonExistentSupplierId}/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId/${equipmentMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof SUPPLIERS === "undefined") return;

    const companyOneFixtures = Object.values(SUPPLIERS).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${companyOneFixtures[0].id}/${equipmentMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${supplierMeta.endpoint}/:supplierId/${equipmentMeta.endpoint}?search=term → 200 returns filtered equipments by supplier and search`, async () => {
    if (typeof SUPPLIERS === "undefined") return;

    const companyOneFixtures = Object.values(SUPPLIERS).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${supplierMeta.endpoint}/${companyOneFixtures[0].id}/${equipmentMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(EQUIPMENTS).filter(
      (f) => f.company.id === COMPANIES.CompanyOne.id && f.supplier?.id === companyOneFixtures[0].id,
    );
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});
