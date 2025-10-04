import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { valueMeta } from "src/features/value/entities/value.meta";
import request from "supertest";
import { VALUES } from "test/data/fixtures/value";
import { testState } from "../../setup/test-state";

describe(`DELETE /${valueMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${valueMeta.endpoint}/:valueId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${valueMeta.endpoint}/:valueId → 403 when user from another company tries to delete a value`, async () => {
    await request(app.getHttpServer())
      .delete(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${valueMeta.endpoint}/:valueId → 404 when value does not exist`, async () => {
    const nonExistentValueId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${valueMeta.endpoint}/${nonExistentValueId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${valueMeta.endpoint}/:valueId → 204 when authenticated user deletes a value`, async () => {
    await request(app.getHttpServer())
      .delete(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});