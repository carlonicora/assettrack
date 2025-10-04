import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { objectionMeta } from "src/features/objection/entities/objection.meta";
import request from "supertest";
import { OBJECTIONS } from "test/data/fixtures/objection";
import { testState } from "../../setup/test-state";

describe(`DELETE /${objectionMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${objectionMeta.endpoint}/:objectionId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${objectionMeta.endpoint}/:objectionId → 403 when user from another company tries to delete a objection`, async () => {
    await request(app.getHttpServer())
      .delete(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${objectionMeta.endpoint}/:objectionId → 404 when objection does not exist`, async () => {
    const nonExistentObjectionId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${objectionMeta.endpoint}/${nonExistentObjectionId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${objectionMeta.endpoint}/:objectionId → 204 when authenticated user deletes a objection`, async () => {
    await request(app.getHttpServer())
      .delete(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});