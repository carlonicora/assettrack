import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { propositionMeta } from "src/features/proposition/entities/proposition.meta";
import request from "supertest";
import { PROPOSITIONS } from "test/data/fixtures/proposition";
import { testState } from "../../setup/test-state";

describe(`DELETE /${propositionMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${propositionMeta.endpoint}/:propositionId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${propositionMeta.endpoint}/${PROPOSITIONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${propositionMeta.endpoint}/:propositionId → 403 when user from another company tries to delete a proposition`, async () => {
    await request(app.getHttpServer())
      .delete(`/${propositionMeta.endpoint}/${PROPOSITIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${propositionMeta.endpoint}/:propositionId → 404 when proposition does not exist`, async () => {
    const nonExistentPropositionId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${propositionMeta.endpoint}/${nonExistentPropositionId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${propositionMeta.endpoint}/:propositionId → 204 when authenticated user deletes a proposition`, async () => {
    await request(app.getHttpServer())
      .delete(`/${propositionMeta.endpoint}/${PROPOSITIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});