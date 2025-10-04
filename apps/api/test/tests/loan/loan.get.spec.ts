import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { LOANS } from "test/data/fixtures/loan";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${loanMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${loanMeta.endpoint}/:loanId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Full.id}`).expect(403);
  });

  it(`GET /${loanMeta.endpoint}/:loanId → 403 when loan from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${loanMeta.endpoint}/${LOANS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${loanMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${loanMeta.endpoint}`).expect(403);
  });

  it(`GET /${loanMeta.endpoint}/:loanId → 200 returns loan with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: loanMeta.endpoint,
      expected: LOANS.CompanyOne_Full,
    });
  });

  it(`GET /${loanMeta.endpoint}/:loanId → 200 returns loan with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: loanMeta.endpoint,
      expected: LOANS.CompanyOne_Nullable,
    });
  });

  it(`GET /${loanMeta.endpoint}/:loanId → 200 returns loan with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: loanMeta.endpoint,
      expected: LOANS.CompanyOne_Minimal,
    });
  });

  it(`GET /${loanMeta.endpoint}/:loanId → 404 when loan does not exist`, async () => {
    const nonExistentLoanId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${loanMeta.endpoint}/${nonExistentLoanId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${loanMeta.endpoint} → 200 returns all loans for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(LOANS).filter((l) => l.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: loanMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${loanMeta.endpoint}?search=CompanyOne → 200 returns filtered loans`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${loanMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: loanMeta.endpoint,
      expected: [LOANS.CompanyOne_Full, LOANS.CompanyOne_Nullable, LOANS.CompanyOne_Minimal],
    });
  });

  it(`GET /${loanMeta.endpoint}?search=Full → 200 returns filtered loans by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${loanMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: loanMeta.endpoint,
      expected: [LOANS.CompanyOne_Full],
    });
  });

  // Other relationship tests - only if fixtures exist
  it(`GET /${employeeMeta.endpoint}/:employeeId/${loanMeta.endpoint} → 200 returns loans by employee`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof EMPLOYEES === "undefined") return;

    const companyOneFixtures = Object.values(EMPLOYEES).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${companyOneFixtures[0].id}/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(LOANS).filter(
      (f) => f.company.id === COMPANIES.CompanyOne.id && f.employee?.id === companyOneFixtures[0].id,
    );
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: loanMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId/${loanMeta.endpoint} → 200 returns empty list when employee does not exist`, async () => {
    if (typeof EMPLOYEES === "undefined") return;

    const nonExistentEmployeeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${nonExistentEmployeeId}/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId/${loanMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof EMPLOYEES === "undefined") return;

    const companyOneFixtures = Object.values(EMPLOYEES).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${companyOneFixtures[0].id}/${loanMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId/${loanMeta.endpoint}?search=term → 200 returns filtered loans by employee and search`, async () => {
    if (typeof EMPLOYEES === "undefined") return;

    const companyOneFixtures = Object.values(EMPLOYEES).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${companyOneFixtures[0].id}/${loanMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(LOANS).filter(
      (f) => f.company.id === COMPANIES.CompanyOne.id && f.employee?.id === companyOneFixtures[0].id,
    );
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: loanMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${equipmentMeta.endpoint}/:equipmentId/${loanMeta.endpoint} → 200 returns loans by equipment`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof EQUIPMENTS === "undefined") return;

    const companyOneFixtures = Object.values(EQUIPMENTS).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${companyOneFixtures[0].id}/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(LOANS).filter(
      (f) => f.company.id === COMPANIES.CompanyOne.id && f.equipment?.id === companyOneFixtures[0].id,
    );
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: loanMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId/${loanMeta.endpoint} → 200 returns empty list when equipment does not exist`, async () => {
    if (typeof EQUIPMENTS === "undefined") return;

    const nonExistentEquipmentId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${nonExistentEquipmentId}/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId/${loanMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof EQUIPMENTS === "undefined") return;

    const companyOneFixtures = Object.values(EQUIPMENTS).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${companyOneFixtures[0].id}/${loanMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${equipmentMeta.endpoint}/:equipmentId/${loanMeta.endpoint}?search=term → 200 returns filtered loans by equipment and search`, async () => {
    if (typeof EQUIPMENTS === "undefined") return;

    const companyOneFixtures = Object.values(EQUIPMENTS).filter((r) => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${equipmentMeta.endpoint}/${companyOneFixtures[0].id}/${loanMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(LOANS).filter(
      (f) => f.company.id === COMPANIES.CompanyOne.id && f.equipment?.id === companyOneFixtures[0].id,
    );
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: loanMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});
