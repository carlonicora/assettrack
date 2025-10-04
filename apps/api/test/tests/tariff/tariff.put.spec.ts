import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { tariffMeta } from "src/features/tariff/entities/tariff.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { TARIFFS } from "test/data/fixtures/tariff";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${tariffMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${tariffMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: TARIFFS.CompanyOne_Full.id,
        attributes: {
          version: "Updated version",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Full.id}`)
      .send(updateTariff)
      .expect(403);
  });

  it(`PUT /${tariffMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: TARIFFS.CompanyTwo_Full.id,
        attributes: {
          version: "Updated version",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${tariffMeta.endpoint}/${TARIFFS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateTariff)
      .expect(403);
  });

  it(`PUT /${tariffMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          version: "Updated version",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${tariffMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateTariff)
      .expect(404);
  });

  it(`PUT /${tariffMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: TARIFFS.CompanyOne_Nullable.id,
        attributes: {
          version: "Updated version",
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateTariff)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: TARIFFS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      version: "Updated version",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${tariffMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: TARIFFS.CompanyOne_Minimal.id,
        attributes: {
          version: "Partially Updated version",
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateTariff)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: TARIFFS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      version: "Partially Updated version",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: tariffMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${tariffMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateTariff)
      .expect(400);
  });

  it(`PUT /${tariffMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateTariff = {
      data: {
        type: tariffMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          version: "Updated version",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateTariff)
      .expect(400);
  });

});