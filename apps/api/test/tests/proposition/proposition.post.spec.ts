import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { propositionMeta } from "src/features/proposition/entities/proposition.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { PAINS } from "test/data/fixtures/pain";
import { painMeta } from "src/features/pain/entities/pain.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${propositionMeta.endpoint}`, () => {
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

  it(`POST /${propositionMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newProposition = {
      data: {
        type: propositionMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pains: {
            data: [
              {
                type: painMeta.endpoint,
                id: companyPainFixtures[0].id
              }
            ]
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${propositionMeta.endpoint}`).send(newProposition).expect(403);
  });

  it(`POST /${propositionMeta.endpoint} → 201 when authenticated user creates a proposition`, async () => {

    const newProposition = {
      data: {
        type: propositionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pains: {
            data: [
              {
                type: painMeta.endpoint,
                id: companyPainFixtures[0].id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProposition)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      pains: [companyPainFixtures[0]],
      name: "Test name",
      description: "Test description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${propositionMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newProposition = {
      data: {
        type: propositionMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProposition)
      .expect(400);
  });

  it(`POST /${propositionMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newProposition = {
      data: {
        type: propositionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProposition)
      .expect(400);
  });

  it(`POST /${propositionMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newProposition = {
      data: {
        type: propositionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pains: {
            data: [{
              type: painMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProposition)
      .expect(400);
  });

  it(`POST /${propositionMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newProposition = {
      data: {
        type: propositionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pains: {
            data: [{
              type: painMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProposition)
      .expect(400);
  });

  it(`POST /${propositionMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyPainFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newProposition = {
      data: {
        type: propositionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          pains: {
            data: [{
              type: "wrong-type",
              id: companyPainFixtures[0].id
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProposition)
      .expect(400);
  });

  it(`POST /${propositionMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyPainFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newProposition = {
      data: {
        type: propositionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          name: "Test Multiple Relationships name",
          description: "Test Multiple Relationships description",
        },
        relationships: {
          pains: {
            data: [
              {
                type: painMeta.endpoint,
                id: companyPainFixtures[0].id
              },
              {
                type: painMeta.endpoint,
                id: companyPainFixtures[1]?.id || companyPainFixtures[0].id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${propositionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProposition)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      pains: [companyPainFixtures[0], companyPainFixtures[1] || companyPainFixtures[0]],
      name: "Test Multiple Relationships name",
      description: "Test Multiple Relationships description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: propositionMeta.endpoint,
      expected: expectedEntity,
    });
  });

});