import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import request from "supertest";
import { LOANS } from "test/data/fixtures/loan";
import { testState } from "../../setup/test-state";

describe(`DELETE /${loanMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${loanMeta.endpoint}/:loanId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${loanMeta.endpoint}/:loanId → 403 when user from another company tries to delete a loan`, async () => {
    await request(app.getHttpServer())
      .delete(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${loanMeta.endpoint}/:loanId → 404 when loan does not exist`, async () => {
    const nonExistentLoanId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${loanMeta.endpoint}/${nonExistentLoanId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${loanMeta.endpoint}/:loanId → 204 when authenticated user deletes a loan`, async () => {
    await request(app.getHttpServer())
      .delete(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});