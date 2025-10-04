import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { feeMeta } from "src/features/fee/entities/fee.meta";
import request from "supertest";
import { FEES } from "test/data/fixtures/fee";
import { testState } from "../../setup/test-state";

describe(`DELETE /${feeMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${feeMeta.endpoint}/:feeId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${feeMeta.endpoint}/${FEES.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${feeMeta.endpoint}/:feeId → 403 when user from another company tries to delete a fee`, async () => {
    await request(app.getHttpServer())
      .delete(`/${feeMeta.endpoint}/${FEES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${feeMeta.endpoint}/:feeId → 404 when fee does not exist`, async () => {
    const nonExistentFeeId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${feeMeta.endpoint}/${nonExistentFeeId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${feeMeta.endpoint}/:feeId → 204 when authenticated user deletes a fee`, async () => {
    await request(app.getHttpServer())
      .delete(`/${feeMeta.endpoint}/${FEES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});