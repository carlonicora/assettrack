import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { accountMeta } from "src/features/account/entities/account.meta";
import { userMeta } from "src/foundations/user/entities/user.meta";
import request from "supertest";
import { ACCOUNTS } from "test/data/fixtures/account";
import { COMPANIES } from "test/data/fixtures/company";
import { USERS } from "test/data/fixtures/user";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${accountMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Full.id}`)
      .send(updateAccount)
      .expect(403);
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
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
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(403);
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          status: "Updated status",
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
      .put(`/${accountMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(404);
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          legalForm: "Updated legalForm",
          status: "Updated status",
          partitaIva: "Updated partitaIva",
          codiceFiscale: "Updated codiceFiscale",
          pec: "Updated pec",
          sdi: "Updated sdi",
          rea: "Updated rea",
          legalAddress: "Updated legalAddress",
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
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: ACCOUNTS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_CompanyAdministrator,
      name: "Updated name",
      legalForm: "Updated legalForm",
      status: "Updated status",
      partitaIva: "Updated partitaIva",
      codiceFiscale: "Updated codiceFiscale",
      pec: "Updated pec",
      sdi: "Updated sdi",
      rea: "Updated rea",
      legalAddress: "Updated legalAddress",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          legalForm: "Partially Updated legalForm",
          status: "Partially Updated status",
          partitaIva: "Partially Updated partitaIva",
          codiceFiscale: "Partially Updated codiceFiscale",
          pec: "Partially Updated pec",
          sdi: "Partially Updated sdi",
          rea: "Partially Updated rea",
          legalAddress: "Partially Updated legalAddress",
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
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: ACCOUNTS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_User,
      name: "Partially Updated name",
      legalForm: "Partially Updated legalForm",
      status: "Partially Updated status",
      partitaIva: "Partially Updated partitaIva",
      codiceFiscale: "Partially Updated codiceFiscale",
      pec: "Partially Updated pec",
      sdi: "Partially Updated sdi",
      rea: "Partially Updated rea",
      legalAddress: "Partially Updated legalAddress",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(400);
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          status: "Updated status",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(400);
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
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
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(400);
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
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
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(400);
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          status: "Updated status",
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
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(400);
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated Multiple name",
          legalForm: "Updated Multiple legalForm",
          status: "Updated Multiple status",
          partitaIva: "Updated Multiple partitaIva",
          codiceFiscale: "Updated Multiple codiceFiscale",
          pec: "Updated Multiple pec",
          sdi: "Updated Multiple sdi",
          rea: "Updated Multiple rea",
          legalAddress: "Updated Multiple legalAddress",
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
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: ACCOUNTS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      users: [USERS.CompanyOne_CompanyAdministrator, USERS.CompanyOne_User],
      owner: USERS.CompanyOne_CompanyAdministrator,
      name: "Updated Multiple name",
      legalForm: "Updated Multiple legalForm",
      status: "Updated Multiple status",
      partitaIva: "Updated Multiple partitaIva",
      codiceFiscale: "Updated Multiple codiceFiscale",
      pec: "Updated Multiple pec",
      sdi: "Updated Multiple sdi",
      rea: "Updated Multiple rea",
      legalAddress: "Updated Multiple legalAddress",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${accountMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updateAccount = {
      data: {
        type: accountMeta.endpoint,
        id: ACCOUNTS.CompanyOne_Full.id,
        attributes: {
          name: "Cleared Relationships name",
          legalForm: "Cleared Relationships name",
          status: "Cleared Relationships name",
          partitaIva: "Cleared Relationships name",
          codiceFiscale: "Cleared Relationships name",
          pec: "Cleared Relationships name",
          sdi: "Cleared Relationships name",
          rea: "Cleared Relationships name",
          legalAddress: "Cleared Relationships name",
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
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${accountMeta.endpoint}/${ACCOUNTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAccount)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: ACCOUNTS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_User,
      name: "Cleared Relationships name",
      legalForm: "Cleared Relationships name",
      status: "Cleared Relationships name",
      partitaIva: "Cleared Relationships name",
      codiceFiscale: "Cleared Relationships name",
      pec: "Cleared Relationships name",
      sdi: "Cleared Relationships name",
      rea: "Cleared Relationships name",
      legalAddress: "Cleared Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: accountMeta.endpoint,
      expected: expectedEntity,
    });
  });
});
