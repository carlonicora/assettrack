import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { authMeta } from "src/foundations/auth/entities/auth.meta";
import request from "supertest";
import { jsonApiValidator } from "test/jsonapi";
import { USERS } from "../../data/fixtures/user";
import { testState } from "../../setup/test-state";

describe("Auth API (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  describe("POST /auth/login", () => {
    it("should login with valid credentials", async () => {
      const loginData = {
        data: {
          type: authMeta.endpoint,
          attributes: {
            email: USERS.CompanyOne_CompanyAdministrator.email,
            password: "password",
          },
        },
      };

      const res = await request(app.getHttpServer()).post("/auth/login").send(loginData).expect(201);

      jsonApiValidator.validateResponse({
        body: res.body,
        type: authMeta.endpoint,
      });

      testState.token = res.body.data.attributes.token;
    });

    it("should return 400 for invalid email format", async () => {
      const loginData = {
        data: {
          type: authMeta.endpoint,
          attributes: {
            email: "invalid-email",
            password: "password",
          },
        },
      };

      await request(app.getHttpServer()).post("/auth/login").send(loginData).expect(400);
    });

    it("should return 400 for missing password", async () => {
      const loginData = {
        data: {
          type: authMeta.endpoint,
          attributes: {
            email: "pippo@pippo.com",
          },
        },
      };

      await request(app.getHttpServer()).post("/auth/login").send(loginData).expect(400);
    });

    it("should return 400 for missing email", async () => {
      const loginData = {
        data: {
          type: authMeta.endpoint,
          attributes: {
            password: "password",
          },
        },
      };

      await request(app.getHttpServer()).post("/auth/login").send(loginData).expect(400);
    });

    it("should return 400 for wrong type", async () => {
      const loginData = {
        data: {
          type: "wrong-type",
          attributes: {
            email: "pippo@pippo.com",
            password: "password",
          },
        },
      };

      await request(app.getHttpServer()).post("/auth/login").send(loginData).expect(400);
    });

    it("should handle unauthorized credentials gracefully", async () => {
      const loginData = {
        data: {
          type: authMeta.endpoint,
          attributes: {
            email: "nonexistent@user.com",
            password: "wrongpassword",
          },
        },
      };

      await request(app.getHttpServer()).post("/auth/login").send(loginData).expect(401);
    });
  });
});
