import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { answerMeta } from "src/features/answer/entities/answer.meta";
import request from "supertest";
import { ANSWERS } from "test/data/fixtures/answer";
import { testState } from "../../setup/test-state";

describe(`DELETE /${answerMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${answerMeta.endpoint}/:answerId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${answerMeta.endpoint}/:answerId → 403 when user from another company tries to delete a answer`, async () => {
    await request(app.getHttpServer())
      .delete(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${answerMeta.endpoint}/:answerId → 404 when answer does not exist`, async () => {
    const nonExistentAnswerId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${answerMeta.endpoint}/${nonExistentAnswerId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${answerMeta.endpoint}/:answerId → 204 when authenticated user deletes a answer`, async () => {
    await request(app.getHttpServer())
      .delete(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});