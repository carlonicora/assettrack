import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import request from "supertest";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { testState } from "../../setup/test-state";

describe(`DELETE /${employeeMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${employeeMeta.endpoint}/:employeeId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${employeeMeta.endpoint}/:employeeId → 403 when user from another company tries to delete a employee`, async () => {
    await request(app.getHttpServer())
      .delete(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${employeeMeta.endpoint}/:employeeId → 404 when employee does not exist`, async () => {
    const nonExistentEmployeeId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${employeeMeta.endpoint}/${nonExistentEmployeeId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${employeeMeta.endpoint}/:employeeId → 204 when authenticated user deletes a employee`, async () => {
    await request(app.getHttpServer())
      .delete(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});