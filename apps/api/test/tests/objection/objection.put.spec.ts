import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { objectionMeta } from "src/features/objection/entities/objection.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { OBJECTIONS } from "test/data/fixtures/objection";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${objectionMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Full.id}`)
      .send(updateObjection)
      .expect(403);
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(403);
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(404);
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          classifications: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: OBJECTIONS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      classifications: [],
      name: "Updated name",
      description: "Updated description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          description: "Partially Updated description",
        },
        relationships: {
          classifications: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: OBJECTIONS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      classifications: [],
      name: "Partially Updated name",
      description: "Partially Updated description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(400);
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(400);
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          classifications: {
            data: [{
              type: classificationMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(400);
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          classifications: {
            data: [{
              type: classificationMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(400);
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          classifications: {
            data: [{
              type: "wrong-type",
              id: CLASSIFICATIONS.CompanyOne_Full.id
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(400);
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated Multiple name",
          description: "Updated Multiple description",
        },
        relationships: {
          classifications: {
            data: [
              {
                type: classificationMeta.endpoint,
                id: CLASSIFICATIONS.CompanyOne_Full.id
              },
              {
                type: classificationMeta.endpoint,
                id: CLASSIFICATIONS.CompanyOne_Nullable.id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: OBJECTIONS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      classifications: [CLASSIFICATIONS.CompanyOne_Full, CLASSIFICATIONS.CompanyOne_Nullable],
      name: "Updated Multiple name",
      description: "Updated Multiple description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${objectionMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updateObjection = {
      data: {
        type: objectionMeta.endpoint,
        id: OBJECTIONS.CompanyOne_Full.id,
        attributes: {
          name: "Cleared Relationships name",
          description: "Cleared Relationships name",
        },
        relationships: {
          classifications: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${objectionMeta.endpoint}/${OBJECTIONS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateObjection)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: OBJECTIONS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      classifications: [],
      name: "Cleared Relationships name",
      description: "Cleared Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: objectionMeta.endpoint,
      expected: expectedEntity,
    });
  });
});