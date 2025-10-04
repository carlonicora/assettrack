import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { rebuttalMeta } from "src/features/rebuttal/entities/rebuttal.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { OBJECTIONS } from "test/data/fixtures/objection";
import { objectionMeta } from "src/features/objection/entities/objection.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${rebuttalMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyObjectionFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyObjectionFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${rebuttalMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: companyObjectionFixtures[0].id
            }
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${rebuttalMeta.endpoint}`).send(newRebuttal).expect(403);
  });

  it(`POST /${rebuttalMeta.endpoint} → 201 when authenticated user creates a rebuttal`, async () => {

    const newRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: companyObjectionFixtures[0].id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newRebuttal)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      objection: companyObjectionFixtures[0],
      name: "Test name",
      description: "Test description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${rebuttalMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newRebuttal)
      .expect(400);
  });

  it(`POST /${rebuttalMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newRebuttal)
      .expect(400);
  });

  it(`POST /${rebuttalMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newRebuttal)
      .expect(400);
  });

  it(`POST /${rebuttalMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newRebuttal)
      .expect(400);
  });

  it(`POST /${rebuttalMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyObjectionFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          objection: {
            data: {
              type: "wrong-type",
              id: companyObjectionFixtures[0].id
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${rebuttalMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newRebuttal)
      .expect(400);
  });

});