import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { counterpartMeta } from "src/features/counterpart/entities/counterpart.meta";
import request from "supertest";
import { COUNTERPARTS } from "test/data/fixtures/counterpart";
import { testState } from "../../setup/test-state";

describe(`DELETE /${counterpartMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${counterpartMeta.endpoint}/:counterpartId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${counterpartMeta.endpoint}/:counterpartId → 403 when user from another company tries to delete a counterpart`, async () => {
    await request(app.getHttpServer())
      .delete(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${counterpartMeta.endpoint}/:counterpartId → 404 when counterpart does not exist`, async () => {
    const nonExistentCounterpartId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${counterpartMeta.endpoint}/${nonExistentCounterpartId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${counterpartMeta.endpoint}/:counterpartId → 204 when authenticated user deletes a counterpart`, async () => {
    await request(app.getHttpServer())
      .delete(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});