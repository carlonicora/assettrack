import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${employeeMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${employeeMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: EMPLOYEES.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Full.id}`)
      .send(updateEmployee)
      .expect(403);
  });

  it(`PUT /${employeeMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: EMPLOYEES.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEmployee)
      .expect(403);
  });

  it(`PUT /${employeeMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${employeeMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEmployee)
      .expect(404);
  });

  it(`PUT /${employeeMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: EMPLOYEES.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          phone: "Updated phone",
          email: "Updated email",
          avatar: "Updated avatar",
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEmployee)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: EMPLOYEES.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      name: "Updated name",
      phone: "Updated phone",
      email: "Updated email",
      avatar: "Updated avatar",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${employeeMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: EMPLOYEES.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          phone: "Partially Updated phone",
          email: "Partially Updated email",
          avatar: "Partially Updated avatar",
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEmployee)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: EMPLOYEES.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      name: "Partially Updated name",
      phone: "Partially Updated phone",
      email: "Partially Updated email",
      avatar: "Partially Updated avatar",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${employeeMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEmployee)
      .expect(400);
  });

  it(`PUT /${employeeMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${employeeMeta.endpoint}/${EMPLOYEES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEmployee)
      .expect(400);
  });

});