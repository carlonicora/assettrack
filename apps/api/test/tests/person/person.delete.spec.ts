import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { personMeta } from "src/features/person/entities/person.meta";
import request from "supertest";
import { PERSONS } from "test/data/fixtures/person";
import { testState } from "../../setup/test-state";

describe(`DELETE /${personMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${personMeta.endpoint}/:personId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${personMeta.endpoint}/:personId → 403 when user from another company tries to delete a person`, async () => {
    await request(app.getHttpServer())
      .delete(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${personMeta.endpoint}/:personId → 404 when person does not exist`, async () => {
    const nonExistentPersonId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${personMeta.endpoint}/${nonExistentPersonId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${personMeta.endpoint}/:personId → 204 when authenticated user deletes a person`, async () => {
    await request(app.getHttpServer())
      .delete(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});