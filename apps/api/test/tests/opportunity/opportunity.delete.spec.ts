import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { opportunityMeta } from "src/features/opportunity/entities/opportunity.meta";
import request from "supertest";
import { OPPORTUNITYS } from "test/data/fixtures/opportunity";
import { testState } from "../../setup/test-state";

describe(`DELETE /${opportunityMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${opportunityMeta.endpoint}/:opportunityId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${opportunityMeta.endpoint}/:opportunityId → 403 when user from another company tries to delete a opportunity`, async () => {
    await request(app.getHttpServer())
      .delete(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${opportunityMeta.endpoint}/:opportunityId → 404 when opportunity does not exist`, async () => {
    const nonExistentOpportunityId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${opportunityMeta.endpoint}/${nonExistentOpportunityId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${opportunityMeta.endpoint}/:opportunityId → 204 when authenticated user deletes a opportunity`, async () => {
    await request(app.getHttpServer())
      .delete(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});