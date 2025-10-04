import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { painMeta } from "src/features/pain/entities/pain.meta";
import request from "supertest";
import { PAINS } from "test/data/fixtures/pain";
import { testState } from "../../setup/test-state";

describe(`DELETE /${painMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${painMeta.endpoint}/:painId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${painMeta.endpoint}/${PAINS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${painMeta.endpoint}/:painId → 403 when user from another company tries to delete a pain`, async () => {
    await request(app.getHttpServer())
      .delete(`/${painMeta.endpoint}/${PAINS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${painMeta.endpoint}/:painId → 404 when pain does not exist`, async () => {
    const nonExistentPainId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${painMeta.endpoint}/${nonExistentPainId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${painMeta.endpoint}/:painId → 204 when authenticated user deletes a pain`, async () => {
    await request(app.getHttpServer())
      .delete(`/${painMeta.endpoint}/${PAINS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});