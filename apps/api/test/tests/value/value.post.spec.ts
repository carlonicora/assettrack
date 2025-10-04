import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { valueMeta } from "src/features/value/entities/value.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { PAINS } from "test/data/fixtures/pain";
import { painMeta } from "src/features/pain/entities/pain.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${valueMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyPainFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyPainFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${valueMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newValue = {
      data: {
        type: valueMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: companyPainFixtures[0].id
            }
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${valueMeta.endpoint}`).send(newValue).expect(403);
  });

  it(`POST /${valueMeta.endpoint} → 201 when authenticated user creates a value`, async () => {

    const newValue = {
      data: {
        type: valueMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: companyPainFixtures[0].id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newValue)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      pain: companyPainFixtures[0],
      name: "Test name",
      description: "Test description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: valueMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${valueMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newValue = {
      data: {
        type: valueMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newValue)
      .expect(400);
  });

  it(`POST /${valueMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newValue = {
      data: {
        type: valueMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newValue)
      .expect(400);
  });

  it(`POST /${valueMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newValue = {
      data: {
        type: valueMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newValue)
      .expect(400);
  });

  it(`POST /${valueMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newValue = {
      data: {
        type: valueMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newValue)
      .expect(400);
  });

  it(`POST /${valueMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyPainFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newValue = {
      data: {
        type: valueMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pain: {
            data: {
              type: "wrong-type",
              id: companyPainFixtures[0].id
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${valueMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newValue)
      .expect(400);
  });

});