import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { accountMeta } from "src/features/account/entities/account.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { USERS } from "test/data/fixtures/user";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { ownerMeta } from "src/foundations/user/entities/user.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${accountMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyUserFixtures: any[];
  let companyOwnerFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${accountMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          status: "Test status",
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
        },
      },
    };

    await request(app.getHttpServer()).post(`/${accountMeta.endpoint}`).send(newAccount).expect(403);
  });

  it(`POST /${accountMeta.endpoint} → 201 when authenticated user creates a account`, async () => {

    const newAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          status: "Test status",
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
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAccount)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      users: [],
      owner: companyOwnerFixtures[0],
      name: "Test name",
      status: "Test status",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${accountMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAccount)
      .expect(400);
  });

  it(`POST /${accountMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAccount)
      .expect(400);
  });

  it(`POST /${accountMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          status: "Test status",
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
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAccount)
      .expect(400);
  });

  it(`POST /${accountMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          status: "Test status",
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
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAccount)
      .expect(400);
  });

  it(`POST /${accountMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          status: "Test status",
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
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAccount)
      .expect(400);
  });

  it(`POST /${accountMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          name: "Test Multiple Relationships name",
          status: "Test Multiple Relationships status",
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
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${accountMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAccount)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      users: [companyUserFixtures[0], companyUserFixtures[1] || companyUserFixtures[0]],
      owner: companyOwnerFixtures[0],
      name: "Test Multiple Relationships name",
      status: "Test Multiple Relationships status",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedEntity,
    });
  });

});