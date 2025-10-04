import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { pipelineMeta } from "src/features/pipeline/entities/pipeline.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { PIPELINES } from "test/data/fixtures/pipeline";
import { testState } from "../../setup/test-state";

describe(`GET /${pipelineMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId → 403 when pipeline from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${pipelineMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${pipelineMeta.endpoint}`).expect(403);
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId → 200 returns pipeline with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: pipelineMeta.endpoint,
      expected: PIPELINES.CompanyOne_Full,
    });
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId → 200 returns pipeline with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: pipelineMeta.endpoint,
      expected: PIPELINES.CompanyOne_Nullable,
    });
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId → 200 returns pipeline with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${PIPELINES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: pipelineMeta.endpoint,
      expected: PIPELINES.CompanyOne_Minimal,
    });
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId → 404 when pipeline does not exist`, async () => {
    const nonExistentPipelineId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${nonExistentPipelineId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${pipelineMeta.endpoint} → 200 returns all pipelines for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(PIPELINES).filter((p) => p.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: pipelineMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${pipelineMeta.endpoint}?search=CompanyOne → 200 returns filtered pipelines`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: pipelineMeta.endpoint,
      expected: [PIPELINES.CompanyOne_Full, PIPELINES.CompanyOne_Nullable, PIPELINES.CompanyOne_Minimal],
    });
  });

  it(`GET /${pipelineMeta.endpoint}?search=Full → 200 returns filtered pipelines by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: pipelineMeta.endpoint,
      expected: [PIPELINES.CompanyOne_Full],
    });
  });


});