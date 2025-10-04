import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { lawMeta } from "src/features/law/entities/law.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { LAWS } from "test/data/fixtures/law";
import { DOCUMENTS } from "test/data/fixtures/document";
import { documentMeta } from "src/features/document/entities/document.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${lawMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Full.id}`)
      .send(updateLaw)
      .expect(403);
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
        },
        relationships: {
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(403);
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
        },
        relationships: {
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(404);
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
        },
        relationships: {
          documents: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: LAWS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      documents: [],
      name: "Updated name",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
        },
        relationships: {
          documents: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: LAWS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      documents: [],
      name: "Partially Updated name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(400);
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(400);
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
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
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(400);
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
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
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(400);
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
        },
        relationships: {
          documents: {
            data: [{
              type: "wrong-type",
              id: DOCUMENTS.CompanyOne_Full.id
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(400);
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated Multiple name",
        },
        relationships: {
          documents: {
            data: [
              {
                type: documentMeta.endpoint,
                id: DOCUMENTS.CompanyOne_Full.id
              },
              {
                type: documentMeta.endpoint,
                id: DOCUMENTS.CompanyOne_Nullable.id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: LAWS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      documents: [DOCUMENTS.CompanyOne_Full, DOCUMENTS.CompanyOne_Nullable],
      name: "Updated Multiple name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${lawMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updateLaw = {
      data: {
        type: lawMeta.endpoint,
        id: LAWS.CompanyOne_Full.id,
        attributes: {
          name: "Cleared Relationships name",
        },
        relationships: {
          documents: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${lawMeta.endpoint}/${LAWS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLaw)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: LAWS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      documents: [],
      name: "Cleared Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: lawMeta.endpoint,
      expected: expectedEntity,
    });
  });
});