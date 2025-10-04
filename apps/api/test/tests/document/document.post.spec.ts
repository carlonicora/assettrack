import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { documentMeta } from "src/features/document/entities/document.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { USERS } from "test/data/fixtures/user";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { ownerMeta } from "src/foundations/user/entities/user.meta";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${documentMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyProceedingFixtures: any[];
  let companyOwnerFixtures: any[];
  let companyUserFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${documentMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          url: "Test url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: companyProceedingFixtures[0].id
            }
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: companyOwnerFixtures[0].id
            }
          },
          users: {
            data: []
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${documentMeta.endpoint}`).send(newDocument).expect(403);
  });

  it(`POST /${documentMeta.endpoint} → 201 when authenticated user creates a document`, async () => {

    const newDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          url: "Test url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: companyProceedingFixtures[0].id
            }
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: companyOwnerFixtures[0].id
            }
          },
          users: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newDocument)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      proceeding: companyProceedingFixtures[0],
      owner: companyOwnerFixtures[0],
      users: [],
      name: "Test name",
      url: "Test url",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${documentMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newDocument)
      .expect(400);
  });

  it(`POST /${documentMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newDocument)
      .expect(400);
  });

  it(`POST /${documentMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          url: "Test url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          users: {
            data: [{
              type: userMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newDocument)
      .expect(400);
  });

  it(`POST /${documentMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          url: "Test url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          users: {
            data: [{
              type: userMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newDocument)
      .expect(400);
  });

  it(`POST /${documentMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          url: "Test url",
        },
        relationships: {
          proceeding: {
            data: {
              type: "wrong-type",
              id: companyProceedingFixtures[0].id
            }
          },
          owner: {
            data: {
              type: "wrong-type",
              id: companyOwnerFixtures[0].id
            }
          },
          users: {
            data: [{
              type: "wrong-type",
              id: companyUserFixtures[0].id
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newDocument)
      .expect(400);
  });

  it(`POST /${documentMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          name: "Test Multiple Relationships name",
          url: "Test Multiple Relationships url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: companyProceedingFixtures[0].id
            }
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: companyOwnerFixtures[0].id
            }
          },
          users: {
            data: [
              {
                type: userMeta.endpoint,
                id: companyUserFixtures[0].id
              },
              {
                type: userMeta.endpoint,
                id: companyUserFixtures[1]?.id || companyUserFixtures[0].id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${documentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newDocument)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      proceeding: companyProceedingFixtures[0],
      owner: companyOwnerFixtures[0],
      users: [companyUserFixtures[0], companyUserFixtures[1] || companyUserFixtures[0]],
      name: "Test Multiple Relationships name",
      url: "Test Multiple Relationships url",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedEntity,
    });
  });

});