import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { tariffMeta } from "src/features/tariff/entities/tariff.meta";
import request from "supertest";
import { TARIFFS } from "test/data/fixtures/tariff";
import { testState } from "../../setup/test-state";

describe(`DELETE /${tariffMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${tariffMeta.endpoint}/:tariffId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${tariffMeta.endpoint}/:tariffId → 403 when user from another company tries to delete a tariff`, async () => {
    await request(app.getHttpServer())
      .delete(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${tariffMeta.endpoint}/:tariffId → 404 when tariff does not exist`, async () => {
    const nonExistentTariffId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${tariffMeta.endpoint}/${nonExistentTariffId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${tariffMeta.endpoint}/:tariffId → 204 when authenticated user deletes a tariff`, async () => {
    await request(app.getHttpServer())
      .delete(`/${tariffMeta.endpoint}/${TARIFFS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});