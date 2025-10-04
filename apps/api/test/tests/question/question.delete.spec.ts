import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { questionMeta } from "src/features/question/entities/question.meta";
import request from "supertest";
import { QUESTIONS } from "test/data/fixtures/question";
import { testState } from "../../setup/test-state";

describe(`DELETE /${questionMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${questionMeta.endpoint}/:questionId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${questionMeta.endpoint}/${QUESTIONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${questionMeta.endpoint}/:questionId → 403 when user from another company tries to delete a question`, async () => {
    await request(app.getHttpServer())
      .delete(`/${questionMeta.endpoint}/${QUESTIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${questionMeta.endpoint}/:questionId → 404 when question does not exist`, async () => {
    const nonExistentQuestionId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${questionMeta.endpoint}/${nonExistentQuestionId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${questionMeta.endpoint}/:questionId → 204 when authenticated user deletes a question`, async () => {
    await request(app.getHttpServer())
      .delete(`/${questionMeta.endpoint}/${QUESTIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});