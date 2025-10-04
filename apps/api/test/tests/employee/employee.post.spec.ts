import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${employeeMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

  });

  it(`POST /${employeeMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
        },
      },
    };

    await request(app.getHttpServer()).post(`/${employeeMeta.endpoint}`).send(newEmployee).expect(403);
  });

  it(`POST /${employeeMeta.endpoint} → 201 when authenticated user creates a employee`, async () => {

    const newEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${employeeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEmployee)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      name: "Test name",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: employeeMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${employeeMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${employeeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEmployee)
      .expect(400);
  });

  it(`POST /${employeeMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newEmployee = {
      data: {
        type: employeeMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${employeeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEmployee)
      .expect(400);
  });


});