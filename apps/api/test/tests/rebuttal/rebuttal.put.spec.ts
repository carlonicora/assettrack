import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { rebuttalMeta } from "src/features/rebuttal/entities/rebuttal.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { REBUTTALS } from "test/data/fixtures/rebuttal";
import { OBJECTIONS } from "test/data/fixtures/objection";
import { objectionMeta } from "src/features/objection/entities/objection.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${rebuttalMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: REBUTTALS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Full.id}`)
      .send(updateRebuttal)
      .expect(403);
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: REBUTTALS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: OBJECTIONS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(403);
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: OBJECTIONS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(404);
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: REBUTTALS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: OBJECTIONS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: REBUTTALS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      objection: OBJECTIONS.CompanyOne_Full,
      name: "Updated name",
      description: "Updated description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: REBUTTALS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          description: "Partially Updated description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: OBJECTIONS.CompanyOne_Minimal.id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: REBUTTALS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      objection: OBJECTIONS.CompanyOne_Minimal,
      name: "Partially Updated name",
      description: "Partially Updated description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: rebuttalMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(400);
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(400);
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: REBUTTALS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(400);
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: REBUTTALS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          objection: {
            data: {
              type: objectionMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(400);
  });

  it(`PUT /${rebuttalMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateRebuttal = {
      data: {
        type: rebuttalMeta.endpoint,
        id: REBUTTALS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          objection: {
            data: {
              type: "wrong-type",
              id: OBJECTIONS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${rebuttalMeta.endpoint}/${REBUTTALS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateRebuttal)
      .expect(400);
  });

});