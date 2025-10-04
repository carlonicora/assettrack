import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { painMeta } from "src/features/pain/entities/pain.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { PAINS } from "test/data/fixtures/pain";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${painMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${painMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Full.id}`)
      .send(updatePain)
      .expect(403);
  });

  it(`PUT /${painMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${painMeta.endpoint}/${PAINS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(403);
  });

  it(`PUT /${painMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
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
      .put(`/${painMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(404);
  });

  it(`PUT /${painMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyOne_Nullable.id,
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
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PAINS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      classifications: [],
      name: "Updated name",
      description: "Updated description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: painMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${painMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyOne_Minimal.id,
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
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: PAINS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      classifications: [],
      name: "Partially Updated name",
      description: "Partially Updated description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: painMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${painMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(400);
  });

  it(`PUT /${painMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(400);
  });

  it(`PUT /${painMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyOne_Minimal.id,
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
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(400);
  });

  it(`PUT /${painMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyOne_Full.id,
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
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(400);
  });

  it(`PUT /${painMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyTwo_Nullable.id,
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
      .put(`/${painMeta.endpoint}/${PAINS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(400);
  });

  it(`PUT /${painMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyOne_Minimal.id,
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
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PAINS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      classifications: [CLASSIFICATIONS.CompanyOne_Full, CLASSIFICATIONS.CompanyOne_Nullable],
      name: "Updated Multiple name",
      description: "Updated Multiple description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: painMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${painMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updatePain = {
      data: {
        type: painMeta.endpoint,
        id: PAINS.CompanyOne_Full.id,
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
      .put(`/${painMeta.endpoint}/${PAINS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updatePain)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: PAINS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      classifications: [],
      name: "Cleared Relationships name",
      description: "Cleared Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: painMeta.endpoint,
      expected: expectedEntity,
    });
  });
});