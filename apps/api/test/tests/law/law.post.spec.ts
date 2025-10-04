import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { lawMeta } from "src/features/law/entities/law.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { DOCUMENTS } from "test/data/fixtures/document";
import { documentMeta } from "src/features/document/entities/document.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${lawMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyDocumentFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyDocumentFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${lawMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
        },
        relationships: {
          documents: {
            data: []
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${lawMeta.endpoint}`).send(newLaw).expect(403);
  });

  it(`POST /${lawMeta.endpoint} → 201 when authenticated user creates a law`, async () => {

    const newLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
        },
        relationships: {
          documents: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLaw)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      documents: [],
      name: "Test name",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${lawMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLaw)
      .expect(400);
  });

  it(`POST /${lawMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLaw)
      .expect(400);
  });

  it(`POST /${lawMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
        },
        relationships: {
          documents: {
            data: [{
              type: documentMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLaw)
      .expect(400);
  });

  it(`POST /${lawMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
        },
        relationships: {
          documents: {
            data: [{
              type: documentMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLaw)
      .expect(400);
  });

  it(`POST /${lawMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyDocumentFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
        },
        relationships: {
          documents: {
            data: [{
              type: "wrong-type",
              id: companyDocumentFixtures[0].id
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLaw)
      .expect(400);
  });

  it(`POST /${lawMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyDocumentFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          name: "Test Multiple Relationships name",
        },
        relationships: {
          documents: {
            data: [
              {
                type: documentMeta.endpoint,
                id: companyDocumentFixtures[0].id
              },
              {
                type: documentMeta.endpoint,
                id: companyDocumentFixtures[1]?.id || companyDocumentFixtures[0].id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${lawMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLaw)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      documents: [companyDocumentFixtures[0], companyDocumentFixtures[1] || companyDocumentFixtures[0]],
      name: "Test Multiple Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: expectedEntity,
    });
  });

});