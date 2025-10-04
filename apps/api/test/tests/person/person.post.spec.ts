import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { personMeta } from "src/features/person/entities/person.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { USERS } from "test/data/fixtures/user";
import { ACCOUNTS } from "test/data/fixtures/account";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { ownerMeta } from "src/foundations/user/entities/user.meta";
import { accountMeta } from "src/features/account/entities/account.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${personMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyUserFixtures: any[];
  let companyOwnerFixtures: any[];
  let companyAccountFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${personMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newPerson = {
      data: {
        type: personMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          firstName: "Test firstName",
          lastName: "Test lastName",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: companyAccountFixtures[0].id
            }
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${personMeta.endpoint}`).send(newPerson).expect(403);
  });

  it(`POST /${personMeta.endpoint} → 201 when authenticated user creates a person`, async () => {

    const newPerson = {
      data: {
        type: personMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          firstName: "Test firstName",
          lastName: "Test lastName",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: companyAccountFixtures[0].id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newPerson)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      users: [],
      owner: companyOwnerFixtures[0],
      account: companyAccountFixtures[0],
      firstName: "Test firstName",
      lastName: "Test lastName",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${personMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newPerson = {
      data: {
        type: personMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newPerson)
      .expect(400);
  });

  it(`POST /${personMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newPerson = {
      data: {
        type: personMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newPerson)
      .expect(400);
  });

  it(`POST /${personMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newPerson = {
      data: {
        type: personMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          firstName: "Test firstName",
          lastName: "Test lastName",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newPerson)
      .expect(400);
  });

  it(`POST /${personMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newPerson = {
      data: {
        type: personMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          firstName: "Test firstName",
          lastName: "Test lastName",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newPerson)
      .expect(400);
  });

  it(`POST /${personMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newPerson = {
      data: {
        type: personMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          firstName: "Test firstName",
          lastName: "Test lastName",
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
          account: {
            data: {
              type: "wrong-type",
              id: companyAccountFixtures[0].id
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newPerson)
      .expect(400);
  });

  it(`POST /${personMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyUserFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyOwnerFixtures = Object.values(USERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newPerson = {
      data: {
        type: personMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          firstName: "Test Multiple Relationships firstName",
          lastName: "Test Multiple Relationships lastName",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: companyAccountFixtures[0].id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${personMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newPerson)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      users: [companyUserFixtures[0], companyUserFixtures[1] || companyUserFixtures[0]],
      owner: companyOwnerFixtures[0],
      account: companyAccountFixtures[0],
      firstName: "Test Multiple Relationships firstName",
      lastName: "Test Multiple Relationships lastName",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedEntity,
    });
  });

});