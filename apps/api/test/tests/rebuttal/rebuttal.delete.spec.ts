import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { rebuttalMeta } from "src/features/rebuttal/entities/rebuttal.meta";
import request from "supertest";
import { REBUTTALS } from "test/data/fixtures/rebuttal";
import { testState } from "../../setup/test-state";

describe(`DELETE /${rebuttalMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${rebuttalMeta.endpoint}/:rebuttalId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${rebuttalMeta.endpoint}/:rebuttalId → 403 when user from another company tries to delete a rebuttal`, async () => {
    await request(app.getHttpServer())
      .delete(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${rebuttalMeta.endpoint}/:rebuttalId → 404 when rebuttal does not exist`, async () => {
    const nonExistentRebuttalId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${rebuttalMeta.endpoint}/${nonExistentRebuttalId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${rebuttalMeta.endpoint}/:rebuttalId → 204 when authenticated user deletes a rebuttal`, async () => {
    await request(app.getHttpServer())
      .delete(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});