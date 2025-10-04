import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import request from "supertest";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { testState } from "../../setup/test-state";

describe(`DELETE /${proceedingMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${proceedingMeta.endpoint}/:proceedingId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${proceedingMeta.endpoint}/:proceedingId → 403 when user from another company tries to delete a proceeding`, async () => {
    await request(app.getHttpServer())
      .delete(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${proceedingMeta.endpoint}/:proceedingId → 404 when proceeding does not exist`, async () => {
    const nonExistentProceedingId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${proceedingMeta.endpoint}/${nonExistentProceedingId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${proceedingMeta.endpoint}/:proceedingId → 204 when authenticated user deletes a proceeding`, async () => {
    await request(app.getHttpServer())
      .delete(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});