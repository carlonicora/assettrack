import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { testState } from "../../setup/test-state";

describe(`GET /${employeeMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId → 403 when employee from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${employeeMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${employeeMeta.endpoint}`).expect(403);
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId → 200 returns employee with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: EMPLOYEES.CompanyOne_Full,
    });
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId → 200 returns employee with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: EMPLOYEES.CompanyOne_Nullable,
    });
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId → 200 returns employee with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: EMPLOYEES.CompanyOne_Minimal,
    });
  });

  it(`GET /${employeeMeta.endpoint}/:employeeId → 404 when employee does not exist`, async () => {
    const nonExistentEmployeeId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}/${nonExistentEmployeeId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${employeeMeta.endpoint} → 200 returns all employees for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(EMPLOYEES).filter((e) => e.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${employeeMeta.endpoint}?search=CompanyOne → 200 returns filtered employees`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: [EMPLOYEES.CompanyOne_Full, EMPLOYEES.CompanyOne_Nullable, EMPLOYEES.CompanyOne_Minimal],
    });
  });

  it(`GET /${employeeMeta.endpoint}?search=Full → 200 returns filtered employees by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${employeeMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: [EMPLOYEES.CompanyOne_Full],
    });
  });


});