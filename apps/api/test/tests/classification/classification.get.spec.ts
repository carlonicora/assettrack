import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import request from "supertest";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`GET /${classificationMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${CLASSIFICATIONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${classificationMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${classificationMeta.endpoint}`).expect(403);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId → 200 returns classification with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${CLASSIFICATIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: classificationMeta.endpoint,
      expected: CLASSIFICATIONS.CompanyOne_Full,
    });
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId → 200 returns classification with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${CLASSIFICATIONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: classificationMeta.endpoint,
      expected: CLASSIFICATIONS.CompanyOne_Nullable,
    });
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId → 200 returns classification with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${CLASSIFICATIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: classificationMeta.endpoint,
      expected: CLASSIFICATIONS.CompanyOne_Minimal,
    });
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId → 404 when classification does not exist`, async () => {
    const nonExistentClassificationId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${nonExistentClassificationId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${classificationMeta.endpoint}?search=CompanyOne → 200 returns filtered classifications`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: classificationMeta.endpoint,
      expected: [
        CLASSIFICATIONS.CompanyOne_Full,
        CLASSIFICATIONS.CompanyOne_Nullable,
        CLASSIFICATIONS.CompanyOne_Minimal,
      ],
    });
  });

  it(`GET /${classificationMeta.endpoint}?search=Full → 200 returns filtered classifications by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: classificationMeta.endpoint,
      expected: [CLASSIFICATIONS.CompanyOne_Full],
    });
  });
});
