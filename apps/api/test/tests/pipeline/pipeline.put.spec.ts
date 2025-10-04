import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { pipelineMeta } from "src/features/pipeline/entities/pipeline.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { PIPELINES } from "test/data/fixtures/pipeline";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${pipelineMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${pipelineMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updatePipeline = {
      data: {
        type: pipelineMeta.endpoint,
        id: PIPELINES.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Full.id}`)
      .send(updatePipeline)
      .expect(403);
  });

  it(`PUT /${pipelineMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updatePipeline = {
      data: {
        type: pipelineMeta.endpoint,
        id: PIPELINES.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePipeline)
      .expect(403);
  });

  it(`PUT /${pipelineMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updatePipeline = {
      data: {
        type: pipelineMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${pipelineMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePipeline)
      .expect(404);
  });

  it(`PUT /${pipelineMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updatePipeline = {
      data: {
        type: pipelineMeta.endpoint,
        id: PIPELINES.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
          stages: "Updated stages",
          isDefault: true,
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePipeline)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PIPELINES.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      name: "Updated name",
      description: "Updated description",
      stages: "Updated stages",
      isDefault: true,
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: pipelineMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${pipelineMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updatePipeline = {
      data: {
        type: pipelineMeta.endpoint,
        id: PIPELINES.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          description: "Partially Updated description",
          stages: "Partially Updated stages",
          isDefault: true,
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePipeline)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: PIPELINES.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      name: "Partially Updated name",
      description: "Partially Updated description",
      stages: "Partially Updated stages",
      isDefault: true,
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: pipelineMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${pipelineMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updatePipeline = {
      data: {
        type: pipelineMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePipeline)
      .expect(400);
  });

  it(`PUT /${pipelineMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updatePipeline = {
      data: {
        type: pipelineMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePipeline)
      .expect(400);
  });

});