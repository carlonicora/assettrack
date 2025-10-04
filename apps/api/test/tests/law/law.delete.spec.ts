import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { lawMeta } from "src/features/law/entities/law.meta";
import request from "supertest";
import { LAWS } from "test/data/fixtures/law";
import { testState } from "../../setup/test-state";

describe(`DELETE /${lawMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${lawMeta.endpoint}/:lawId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${lawMeta.endpoint}/:lawId → 403 when user from another company tries to delete a law`, async () => {
    await request(app.getHttpServer())
      .delete(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${lawMeta.endpoint}/:lawId → 404 when law does not exist`, async () => {
    const nonExistentLawId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${lawMeta.endpoint}/${nonExistentLawId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${lawMeta.endpoint}/:lawId → 204 when authenticated user deletes a law`, async () => {
    await request(app.getHttpServer())
      .delete(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});