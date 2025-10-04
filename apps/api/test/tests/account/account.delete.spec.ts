import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { accountMeta } from "src/features/account/entities/account.meta";
import request from "supertest";
import { ACCOUNTS } from "test/data/fixtures/account";
import { testState } from "../../setup/test-state";

describe(`DELETE /${accountMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${accountMeta.endpoint}/:accountId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${accountMeta.endpoint}/:accountId → 403 when user from another company tries to delete a account`, async () => {
    await request(app.getHttpServer())
      .delete(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${accountMeta.endpoint}/:accountId → 404 when account does not exist`, async () => {
    const nonExistentAccountId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${accountMeta.endpoint}/${nonExistentAccountId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${accountMeta.endpoint}/:accountId → 204 when authenticated user deletes a account`, async () => {
    await request(app.getHttpServer())
      .delete(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});