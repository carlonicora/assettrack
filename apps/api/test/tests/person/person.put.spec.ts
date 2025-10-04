import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { accountMeta } from "src/features/account/entities/account.meta";
import { personMeta } from "src/features/person/entities/person.meta";
import { userMeta } from "src/foundations/user/entities/user.meta";
import request from "supertest";
import { ACCOUNTS } from "test/data/fixtures/account";
import { COMPANIES } from "test/data/fixtures/company";
import { PERSONS } from "test/data/fixtures/person";
import { USERS } from "test/data/fixtures/user";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${personMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${personMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyOne_Full.id,
        attributes: {
          firstName: "Updated firstName",
          lastName: "Updated lastName",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Full.id}`)
      .send(updatePerson)
      .expect(403);
  });

  it(`PUT /${personMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyTwo_Full.id,
        attributes: {
          firstName: "Updated firstName",
          lastName: "Updated lastName",
        },
        relationships: {
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(403);
  });

  it(`PUT /${personMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          firstName: "Updated firstName",
          lastName: "Updated lastName",
        },
        relationships: {
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(404);
  });

  it(`PUT /${personMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyOne_Nullable.id,
        attributes: {
          title: "Updated title",
          firstName: "Updated firstName",
          lastName: "Updated lastName",
          codiceFiscale: "Updated codiceFiscale",
          partitaIva: "Updated partitaIva",
          dateOfBirth: new Date().toISOString(),
          placeOfBirth: "Updated placeOfBirth",
          nationality: "Updated nationality",
          pec: "Updated pec",
          email: "Updated email",
          phone: "Updated phone",
          address: "Updated address",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PERSONS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_CompanyAdministrator,
      account: ACCOUNTS.CompanyOne_Full,
      title: "Updated title",
      firstName: "Updated firstName",
      lastName: "Updated lastName",
      codiceFiscale: "Updated codiceFiscale",
      partitaIva: "Updated partitaIva",
      dateOfBirth: updatePerson.data.attributes.dateOfBirth,
      placeOfBirth: "Updated placeOfBirth",
      nationality: "Updated nationality",
      pec: "Updated pec",
      email: "Updated email",
      phone: "Updated phone",
      address: "Updated address",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${personMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyOne_Minimal.id,
        attributes: {
          title: "Partially Updated title",
          firstName: "Partially Updated firstName",
          lastName: "Partially Updated lastName",
          codiceFiscale: "Partially Updated codiceFiscale",
          partitaIva: "Partially Updated partitaIva",
          dateOfBirth: new Date().toISOString(),
          placeOfBirth: "Partially Updated placeOfBirth",
          nationality: "Partially Updated nationality",
          pec: "Partially Updated pec",
          email: "Partially Updated email",
          phone: "Partially Updated phone",
          address: "Partially Updated address",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Minimal.id,
            },
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: PERSONS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_User,
      account: ACCOUNTS.CompanyOne_Minimal,
      title: "Partially Updated title",
      firstName: "Partially Updated firstName",
      lastName: "Partially Updated lastName",
      codiceFiscale: "Partially Updated codiceFiscale",
      partitaIva: "Partially Updated partitaIva",
      dateOfBirth: updatePerson.data.attributes.dateOfBirth,
      placeOfBirth: "Partially Updated placeOfBirth",
      nationality: "Partially Updated nationality",
      pec: "Partially Updated pec",
      email: "Partially Updated email",
      phone: "Partially Updated phone",
      address: "Partially Updated address",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${personMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(400);
  });

  it(`PUT /${personMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          firstName: "Updated firstName",
          lastName: "Updated lastName",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(400);
  });

  it(`PUT /${personMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyOne_Minimal.id,
        attributes: {
          firstName: "Updated firstName",
          lastName: "Updated lastName",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: "invalid-uuid",
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(400);
  });

  it(`PUT /${personMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyOne_Full.id,
        attributes: {
          firstName: "Updated firstName",
          lastName: "Updated lastName",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000",
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(400);
  });

  it(`PUT /${personMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyTwo_Nullable.id,
        attributes: {
          firstName: "Updated firstName",
          lastName: "Updated lastName",
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
          account: {
            data: {
              type: "wrong-type",
              id: ACCOUNTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(400);
  });

  it(`PUT /${personMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyOne_Minimal.id,
        attributes: {
          title: "Updated Multiple title",
          firstName: "Updated Multiple firstName",
          lastName: "Updated Multiple lastName",
          codiceFiscale: "Updated Multiple codiceFiscale",
          partitaIva: "Updated Multiple partitaIva",
          dateOfBirth: new Date().toISOString(),
          placeOfBirth: "Updated Multiple placeOfBirth",
          nationality: "Updated Multiple nationality",
          pec: "Updated Multiple pec",
          email: "Updated Multiple email",
          phone: "Updated Multiple phone",
          address: "Updated Multiple address",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PERSONS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      users: [USERS.CompanyOne_CompanyAdministrator, USERS.CompanyOne_User],
      owner: USERS.CompanyOne_CompanyAdministrator,
      account: ACCOUNTS.CompanyOne_Full,
      title: "Updated Multiple title",
      firstName: "Updated Multiple firstName",
      lastName: "Updated Multiple lastName",
      codiceFiscale: "Updated Multiple codiceFiscale",
      partitaIva: "Updated Multiple partitaIva",
      dateOfBirth: updatePerson.data.attributes.dateOfBirth,
      placeOfBirth: "Updated Multiple placeOfBirth",
      nationality: "Updated Multiple nationality",
      pec: "Updated Multiple pec",
      email: "Updated Multiple email",
      phone: "Updated Multiple phone",
      address: "Updated Multiple address",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${personMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updatePerson = {
      data: {
        type: personMeta.endpoint,
        id: PERSONS.CompanyOne_Full.id,
        attributes: {
          title: "Cleared Relationships name",
          firstName: "Cleared Relationships name",
          lastName: "Cleared Relationships name",
          codiceFiscale: "Cleared Relationships name",
          partitaIva: "Cleared Relationships name",
          dateOfBirth: new Date().toISOString(),
          placeOfBirth: "Cleared Relationships name",
          nationality: "Cleared Relationships name",
          pec: "Cleared Relationships name",
          email: "Cleared Relationships name",
          phone: "Cleared Relationships name",
          address: "Cleared Relationships name",
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
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Minimal.id,
            },
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${personMeta.endpoint}/${PERSONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePerson)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PERSONS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      users: [],
      owner: USERS.CompanyOne_User,
      account: ACCOUNTS.CompanyOne_Minimal,
      title: "Cleared Relationships name",
      firstName: "Cleared Relationships name",
      lastName: "Cleared Relationships name",
      codiceFiscale: "Cleared Relationships name",
      partitaIva: "Cleared Relationships name",
      dateOfBirth: updatePerson.data.attributes.dateOfBirth,
      placeOfBirth: "Cleared Relationships name",
      nationality: "Cleared Relationships name",
      pec: "Cleared Relationships name",
      email: "Cleared Relationships name",
      phone: "Cleared Relationships name",
      address: "Cleared Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: personMeta.endpoint,
      expected: expectedEntity,
    });
  });
});
