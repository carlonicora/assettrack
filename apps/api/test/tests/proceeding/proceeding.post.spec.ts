import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { USERS } from "test/data/fixtures/user";
import { ACCOUNTS } from "test/data/fixtures/account";
import { PERSONS } from "test/data/fixtures/person";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { ownerMeta } from "src/foundations/user/entities/user.meta";
import { accountMeta } from "src/features/account/entities/account.meta";
import { personMeta } from "src/features/person/entities/person.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${proceedingMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyUserFixtures: any[];
  let companyOwnerFixtures: any[];
  let companyAccountFixtures: any[];
  let companyPersonFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyPersonFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${proceedingMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          status: "Test status",
          classification: "Test classification",
        },
        relationships: {
          users: {
            data: []
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: companyOwnerFixtures[0].id
            }
          },
          accounts: {
            data: []
          },
          persons: {
            data: []
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${proceedingMeta.endpoint}`).send(newProceeding).expect(403);
  });

  it(`POST /${proceedingMeta.endpoint} → 201 when authenticated user creates a proceeding`, async () => {

    const newProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          status: "Test status",
          classification: "Test classification",
        },
        relationships: {
          users: {
            data: []
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: companyOwnerFixtures[0].id
            }
          },
          accounts: {
            data: []
          },
          persons: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProceeding)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      users: [],
      owner: companyOwnerFixtures[0],
      accounts: [],
      persons: [],
      name: "Test name",
      status: "Test status",
      classification: "Test classification",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${proceedingMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProceeding)
      .expect(400);
  });

  it(`POST /${proceedingMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProceeding)
      .expect(400);
  });

  it(`POST /${proceedingMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          status: "Test status",
          classification: "Test classification",
        },
        relationships: {
          users: {
            data: [{
              type: userMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          accounts: {
            data: [{
              type: accountMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
          persons: {
            data: [{
              type: personMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProceeding)
      .expect(400);
  });

  it(`POST /${proceedingMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          status: "Test status",
          classification: "Test classification",
        },
        relationships: {
          users: {
            data: [{
              type: userMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          accounts: {
            data: [{
              type: accountMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
          persons: {
            data: [{
              type: personMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProceeding)
      .expect(400);
  });

  it(`POST /${proceedingMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyPersonFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          status: "Test status",
          classification: "Test classification",
        },
        relationships: {
          users: {
            data: [{
              type: "wrong-type",
              id: companyUserFixtures[0].id
            }]
          },
          owner: {
            data: {
              type: "wrong-type",
              id: companyOwnerFixtures[0].id
            }
          },
          accounts: {
            data: [{
              type: "wrong-type",
              id: companyAccountFixtures[0].id
            }]
          },
          persons: {
            data: [{
              type: "wrong-type",
              id: companyPersonFixtures[0].id
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProceeding)
      .expect(400);
  });

  it(`POST /${proceedingMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyPersonFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          name: "Test Multiple Relationships name",
          status: "Test Multiple Relationships status",
          classification: "Test Multiple Relationships classification",
        },
        relationships: {
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
          owner: {
            data: {
              type: userMeta.endpoint,
              id: companyOwnerFixtures[0].id
            }
          },
          accounts: {
            data: [
              {
                type: accountMeta.endpoint,
                id: companyAccountFixtures[0].id
              },
              {
                type: accountMeta.endpoint,
                id: companyAccountFixtures[1]?.id || companyAccountFixtures[0].id
              }
            ]
          },
          persons: {
            data: [
              {
                type: personMeta.endpoint,
                id: companyPersonFixtures[0].id
              },
              {
                type: personMeta.endpoint,
                id: companyPersonFixtures[1]?.id || companyPersonFixtures[0].id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${proceedingMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newProceeding)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      users: [companyUserFixtures[0], companyUserFixtures[1] || companyUserFixtures[0]],
      owner: companyOwnerFixtures[0],
      accounts: [companyAccountFixtures[0], companyAccountFixtures[1] || companyAccountFixtures[0]],
      persons: [companyPersonFixtures[0], companyPersonFixtures[1] || companyPersonFixtures[0]],
      name: "Test Multiple Relationships name",
      status: "Test Multiple Relationships status",
      classification: "Test Multiple Relationships classification",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedEntity,
    });
  });

});