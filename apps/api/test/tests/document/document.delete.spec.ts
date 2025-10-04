import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { documentMeta } from "src/features/document/entities/document.meta";
import request from "supertest";
import { DOCUMENTS } from "test/data/fixtures/document";
import { testState } from "../../setup/test-state";

describe(`DELETE /${documentMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${documentMeta.endpoint}/:documentId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${documentMeta.endpoint}/:documentId → 403 when user from another company tries to delete a document`, async () => {
    await request(app.getHttpServer())
      .delete(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${documentMeta.endpoint}/:documentId → 404 when document does not exist`, async () => {
    const nonExistentDocumentId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${documentMeta.endpoint}/${nonExistentDocumentId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${documentMeta.endpoint}/:documentId → 204 when authenticated user deletes a document`, async () => {
    await request(app.getHttpServer())
      .delete(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});