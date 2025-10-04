import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { documentMeta } from "src/features/document/entities/document.meta";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { userMeta } from "src/foundations/user/entities/user.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { DOCUMENTS } from "test/data/fixtures/document";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { USERS } from "test/data/fixtures/user";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${documentMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          url: "Updated url",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Full.id}`)
      .send(updateDocument)
      .expect(403);
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          url: "Updated url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: PROCEEDINGS.CompanyOne_Full.id,
            },
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

    await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(403);
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          url: "Updated url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: PROCEEDINGS.CompanyOne_Full.id,
            },
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

    await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(404);
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          folder: "Updated folder",
          url: "Updated url",
          classification: "Updated classification",
          abstract: "Updated abstract",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: PROCEEDINGS.CompanyOne_Full.id,
            },
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
          users: {
            data: [],
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: DOCUMENTS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      proceeding: PROCEEDINGS.CompanyOne_Full,
      owner: USERS.CompanyOne_CompanyAdministrator,
      users: [],
      name: "Updated name",
      folder: "Updated folder",
      url: "Updated url",
      classification: "Updated classification",
      abstract: "Updated abstract",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          folder: "Partially Updated folder",
          url: "Partially Updated url",
          classification: "Partially Updated classification",
          abstract: "Partially Updated abstract",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: PROCEEDINGS.CompanyOne_Minimal.id,
            },
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_User.id,
            },
          },
          users: {
            data: [],
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: DOCUMENTS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      proceeding: PROCEEDINGS.CompanyOne_Minimal,
      owner: USERS.CompanyOne_User,
      users: [],
      name: "Partially Updated name",
      folder: "Partially Updated folder",
      url: "Partially Updated url",
      classification: "Partially Updated classification",
      abstract: "Partially Updated abstract",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(400);
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          url: "Updated url",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(400);
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          url: "Updated url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: "invalid-uuid",
            },
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: "invalid-uuid",
            },
          },
          users: {
            data: [
              {
                type: userMeta.endpoint,
                id: "invalid-uuid",
              },
            ],
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(400);
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          url: "Updated url",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000",
            },
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000",
            },
          },
          users: {
            data: [
              {
                type: userMeta.endpoint,
                id: "00000000-0000-0000-0000-000000000000",
              },
            ],
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(400);
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          url: "Updated url",
        },
        relationships: {
          proceeding: {
            data: {
              type: "wrong-type",
              id: PROCEEDINGS.CompanyOne_Full.id,
            },
          },
          owner: {
            data: {
              type: "wrong-type",
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
          users: {
            data: [
              {
                type: "wrong-type",
                id: USERS.CompanyOne_CompanyAdministrator.id,
              },
            ],
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(400);
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated Multiple name",
          folder: "Updated Multiple folder",
          url: "Updated Multiple url",
          classification: "Updated Multiple classification",
          abstract: "Updated Multiple abstract",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: PROCEEDINGS.CompanyOne_Full.id,
            },
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_CompanyAdministrator.id,
            },
          },
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
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: DOCUMENTS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      proceeding: PROCEEDINGS.CompanyOne_Full,
      owner: USERS.CompanyOne_CompanyAdministrator,
      users: [USERS.CompanyOne_CompanyAdministrator, USERS.CompanyOne_User],
      name: "Updated Multiple name",
      folder: "Updated Multiple folder",
      url: "Updated Multiple url",
      classification: "Updated Multiple classification",
      abstract: "Updated Multiple abstract",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${documentMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updateDocument = {
      data: {
        type: documentMeta.endpoint,
        id: DOCUMENTS.CompanyOne_Full.id,
        attributes: {
          name: "Cleared Relationships name",
          folder: "Cleared Relationships name",
          url: "Cleared Relationships name",
          classification: "Cleared Relationships name",
          abstract: "Cleared Relationships name",
        },
        relationships: {
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: PROCEEDINGS.CompanyOne_Minimal.id,
            },
          },
          owner: {
            data: {
              type: userMeta.endpoint,
              id: USERS.CompanyOne_User.id,
            },
          },
          users: {
            data: [],
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${documentMeta.endpoint}/${DOCUMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateDocument)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: DOCUMENTS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      proceeding: PROCEEDINGS.CompanyOne_Minimal,
      owner: USERS.CompanyOne_User,
      users: [],
      name: "Cleared Relationships name",
      folder: "Cleared Relationships name",
      url: "Cleared Relationships name",
      classification: "Cleared Relationships name",
      abstract: "Cleared Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: documentMeta.endpoint,
      expected: expectedEntity,
    });
  });
});
