import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { accountMeta } from "src/features/account/entities/account.meta";
import { personMeta } from "src/features/person/entities/person.meta";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { userMeta } from "src/foundations/user/entities/user.meta";
import request from "supertest";
import { ACCOUNTS } from "test/data/fixtures/account";
import { COMPANIES } from "test/data/fixtures/company";
import { PERSONS } from "test/data/fixtures/person";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { USERS } from "test/data/fixtures/user";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${proceedingMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
          classification: "Updated classification",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Full.id}`)
      .send(updateProceeding)
      .expect(403);
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
          classification: "Updated classification",
        },
        relationships: {
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(403);
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          status: "Updated status",
          classification: "Updated classification",
        },
        relationships: {
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(404);
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
          classification: "Updated classification",
        },
        relationships: {
          users: {
            data: [],
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
          accounts: {
            data: [],
          },
          persons: {
            data: [],
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PROCEEDINGS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_CompanyAdministrator,
      accounts: [],
      persons: [],
      name: "Updated name",
      status: "Updated status",
      classification: "Updated classification",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          status: "Partially Updated status",
          classification: "Partially Updated classification",
        },
        relationships: {
          users: {
            data: [],
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_User.id,
            },
          },
          accounts: {
            data: [],
          },
          persons: {
            data: [],
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: PROCEEDINGS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_User,
      accounts: [],
      persons: [],
      name: "Partially Updated name",
      status: "Partially Updated status",
      classification: "Partially Updated classification",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(400);
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          status: "Updated status",
          classification: "Updated classification",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(400);
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
          classification: "Updated classification",
        },
        relationships: {
          users: {
            data: [
              {
                type: userMeta.endpoint,
                id: "invalid-uuid",
              },
            ],
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: "invalid-uuid",
            },
          },
          accounts: {
            data: [
              {
                type: accountMeta.endpoint,
                id: "invalid-uuid",
              },
            ],
          },
          persons: {
            data: [
              {
                type: personMeta.endpoint,
                id: "invalid-uuid",
              },
            ],
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(400);
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
          classification: "Updated classification",
        },
        relationships: {
          users: {
            data: [
              {
                type: userMeta.endpoint,
                id: "00000000-0000-0000-0000-000000000000",
              },
            ],
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000",
            },
          },
          accounts: {
            data: [
              {
                type: accountMeta.endpoint,
                id: "00000000-0000-0000-0000-000000000000",
              },
            ],
          },
          persons: {
            data: [
              {
                type: personMeta.endpoint,
                id: "00000000-0000-0000-0000-000000000000",
              },
            ],
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(400);
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
          classification: "Updated classification",
        },
        relationships: {
          users: {
            data: [
              {
                type: "wrong-type",
                id: USERS.CompanyOne_CompanyAdministrator.id,
              },
            ],
          },
          owner: {
            data: {
              type: "wrong-type",
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
          accounts: {
            data: [
              {
                type: "wrong-type",
                id: ACCOUNTS.CompanyOne_Full.id,
              },
            ],
          },
          persons: {
            data: [
              {
                type: "wrong-type",
                id: PERSONS.CompanyOne_Full.id,
              },
            ],
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(400);
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated Multiple name",
          status: "Updated Multiple status",
          classification: "Updated Multiple classification",
        },
        relationships: {
          users: {
            data: [
              {
                type: userMeta.endpoint,
                id: USERS.CompanyOne_CompanyAdministrator.id,
              },
              {
                type: userMeta.endpoint,
                id: USERS.CompanyOne_User.id,
              },
            ],
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
          accounts: {
            data: [
              {
                type: accountMeta.endpoint,
                id: ACCOUNTS.CompanyOne_Full.id,
              },
              {
                type: accountMeta.endpoint,
                id: ACCOUNTS.CompanyOne_Nullable.id,
              },
            ],
          },
          persons: {
            data: [
              {
                type: personMeta.endpoint,
                id: PERSONS.CompanyOne_Full.id,
              },
              {
                type: personMeta.endpoint,
                id: PERSONS.CompanyOne_Nullable.id,
              },
            ],
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PROCEEDINGS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      users: [USERS.CompanyOne_CompanyAdministrator, USERS.CompanyOne_User],
      owner: USERS.CompanyOne_CompanyAdministrator,
      accounts: [ACCOUNTS.CompanyOne_Full, ACCOUNTS.CompanyOne_Nullable],
      persons: [PERSONS.CompanyOne_Full, PERSONS.CompanyOne_Nullable],
      name: "Updated Multiple name",
      status: "Updated Multiple status",
      classification: "Updated Multiple classification",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${proceedingMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updateProceeding = {
      data: {
        type: proceedingMeta.endpoint,
        id: PROCEEDINGS.CompanyOne_Full.id,
        attributes: {
          name: "Cleared Relationships name",
          status: "Cleared Relationships name",
          classification: "Cleared Relationships name",
        },
        relationships: {
          users: {
            data: [],
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_User.id,
            },
          },
          accounts: {
            data: [],
          },
          persons: {
            data: [],
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${proceedingMeta.endpoint}/${PROCEEDINGS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateProceeding)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PROCEEDINGS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_User,
      accounts: [],
      persons: [],
      name: "Cleared Relationships name",
      status: "Cleared Relationships name",
      classification: "Cleared Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: proceedingMeta.endpoint,
      expected: expectedEntity,
    });
  });
});
