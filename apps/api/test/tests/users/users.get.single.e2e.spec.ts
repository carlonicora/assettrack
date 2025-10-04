import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { userMeta } from "src/foundations/user/entities/user.meta";
import request from "supertest";
import { jsonApiValidator } from "test/jsonapi";
import { USERS } from "../../data/fixtures/user";
import { testState } from "../../setup/test-state";

describe("GET /users/:userId", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it("should return a 403 when called by an unlogged user calling /users/me", async () => {
    await request(app.getHttpServer()).get(`/users/me`).expect(403);
  });

  it("should return a 403 when called by an unlogged user trying to get any user", async () => {
    await request(app.getHttpServer()).get(`/users/${USERS.CompanyOne_CompanyAdministrator.id}`).expect(403);
  });

  it("should return complete personal profile data when accessing /users/me", async () => {
    const res = await request(app.getHttpServer())
      .get("/users/me")
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: userMeta.endpoint,
      expected: USERS.CompanyOne_CompanyAdministrator,
    });
  });

  it("should return complete personal profile data when accessing /users/:myid", async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${USERS.CompanyOne_CompanyAdministrator.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: userMeta.endpoint,
      expected: USERS.CompanyOne_CompanyAdministrator,
    });
  });

  // it("should return user profile by specific userId", async () => {
  //   const res = await request(app.getHttpServer())
  //     .get(`/users/${USERS.TaxonomyCurator.id}`)
  //     .set("Authorization", `Bearer ${testState.token}`)
  //     .expect(200);

  //   jsonApiValidator.validateResponse({
  //     body: res.body,
  //     type: userMeta.endpoint,
  //     expected: USERS.TaxonomyCurator,
  //   });
  // });

  it("should return 404 for non-existent user", async () => {
    const nonExistentUserId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/users/${nonExistentUserId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it("should return 404 for users of another company", async () => {
    await request(app.getHttpServer())
      .get(`/users/${USERS.CompanyTwo_CompanyAdministrator.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it("should return 403 for unauthenticated requests", async () => {
    await request(app.getHttpServer()).get("/users/me").expect(403);
  });
});
