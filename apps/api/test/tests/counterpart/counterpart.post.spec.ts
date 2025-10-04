import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { counterpartMeta } from "src/features/counterpart/entities/counterpart.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { COUNTERPARTS } from "test/data/fixtures/counterpart";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { DOCUMENTS } from "test/data/fixtures/document";
import { counterpartMeta } from "src/features/counterpart/entities/counterpart.meta";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { documentMeta } from "src/features/document/entities/document.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${counterpartMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyCounterpartFixtures: any[];
  let companyProceedingFixtures: any[];
  let companyDocumentFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyCounterpartFixtures = Object.values(COUNTERPARTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyDocumentFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${counterpartMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: {
              type: counterpartMeta.endpoint,
              id: companyCounterpartFixtures[0].id
            }
          },
          proceedings: {
            data: [
              {
                type: proceedingMeta.endpoint,
                id: companyProceedingFixtures[0].id
              }
            ]
          },
          documents: {
            data: []
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${counterpartMeta.endpoint}`).send(newCounterpart).expect(403);
  });

  it(`POST /${counterpartMeta.endpoint} → 201 when authenticated user creates a counterpart`, async () => {

    const newCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: {
              type: counterpartMeta.endpoint,
              id: companyCounterpartFixtures[0].id
            }
          },
          proceedings: {
            data: [
              {
                type: proceedingMeta.endpoint,
                id: companyProceedingFixtures[0].id
              }
            ]
          },
          documents: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newCounterpart)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      counterpart: companyCounterpartFixtures[0],
      proceedings: [companyProceedingFixtures[0]],
      documents: [],
      name: "Test name",
      isCompany: true,
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${counterpartMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newCounterpart)
      .expect(400);
  });

  it(`POST /${counterpartMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newCounterpart)
      .expect(400);
  });

  it(`POST /${counterpartMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: {
              type: counterpartMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          proceedings: {
            data: [{
              type: proceedingMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
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
      .post(`/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newCounterpart)
      .expect(400);
  });

  it(`POST /${counterpartMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: {
              type: counterpartMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          proceedings: {
            data: [{
              type: proceedingMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
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
      .post(`/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newCounterpart)
      .expect(400);
  });

  it(`POST /${counterpartMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyCounterpartFixtures = Object.values(COUNTERPARTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyDocumentFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: {
              type: "wrong-type",
              id: companyCounterpartFixtures[0].id
            }
          },
          proceedings: {
            data: [{
              type: "wrong-type",
              id: companyProceedingFixtures[0].id
            }]
          },
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
      .post(`/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newCounterpart)
      .expect(400);
  });

  it(`POST /${counterpartMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyCounterpartFixtures = Object.values(COUNTERPARTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyDocumentFixtures = Object.values(DOCUMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          name: "Test Multiple Relationships name",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: {
              type: counterpartMeta.endpoint,
              id: companyCounterpartFixtures[0].id
            }
          },
          proceedings: {
            data: [
              {
                type: proceedingMeta.endpoint,
                id: companyProceedingFixtures[0].id
              },
              {
                type: proceedingMeta.endpoint,
                id: companyProceedingFixtures[1]?.id || companyProceedingFixtures[0].id
              }
            ]
          },
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
      .post(`/${counterpartMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newCounterpart)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      counterpart: companyCounterpartFixtures[0],
      proceedings: [companyProceedingFixtures[0], companyProceedingFixtures[1] || companyProceedingFixtures[0]],
      documents: [companyDocumentFixtures[0], companyDocumentFixtures[1] || companyDocumentFixtures[0]],
      name: "Test Multiple Relationships name",
      isCompany: true,
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedEntity,
    });
  });

});