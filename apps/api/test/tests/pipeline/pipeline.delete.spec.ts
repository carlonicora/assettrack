import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { pipelineMeta } from "src/features/pipeline/entities/pipeline.meta";
import request from "supertest";
import { PIPELINES } from "test/data/fixtures/pipeline";
import { testState } from "../../setup/test-state";

describe(`DELETE /${pipelineMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${pipelineMeta.endpoint}/:pipelineId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${pipelineMeta.endpoint}/:pipelineId → 403 when user from another company tries to delete a pipeline`, async () => {
    await request(app.getHttpServer())
      .delete(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${pipelineMeta.endpoint}/:pipelineId → 404 when pipeline does not exist`, async () => {
    const nonExistentPipelineId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${pipelineMeta.endpoint}/${nonExistentPipelineId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${pipelineMeta.endpoint}/:pipelineId → 204 when authenticated user deletes a pipeline`, async () => {
    await request(app.getHttpServer())
      .delete(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});