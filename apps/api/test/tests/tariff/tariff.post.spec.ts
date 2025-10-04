import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { tariffMeta } from "src/features/tariff/entities/tariff.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${tariffMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

  });

  it(`POST /${tariffMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          version: "Test version",
        },
      },
    };

    await request(app.getHttpServer()).post(`/${tariffMeta.endpoint}`).send(newTariff).expect(403);
  });

  it(`POST /${tariffMeta.endpoint} → 201 when authenticated user creates a tariff`, async () => {

    const newTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          version: "Test version",
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${tariffMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newTariff)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      version: "Test version",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${tariffMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${tariffMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newTariff)
      .expect(400);
  });

  it(`POST /${tariffMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${tariffMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newTariff)
      .expect(400);
  });


});