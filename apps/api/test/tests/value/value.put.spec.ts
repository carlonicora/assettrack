import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { valueMeta } from "src/features/value/entities/value.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { VALUES } from "test/data/fixtures/value";
import { PAINS } from "test/data/fixtures/pain";
import { painMeta } from "src/features/pain/entities/pain.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${valueMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: VALUES.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Full.id}`)
      .send(updateValue)
      .expect(403);
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: VALUES.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: PAINS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(403);
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: PAINS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(404);
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: VALUES.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: PAINS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: VALUES.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      pain: PAINS.CompanyOne_Full,
      name: "Updated name",
      description: "Updated description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: valueMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: VALUES.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          description: "Partially Updated description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: PAINS.CompanyOne_Minimal.id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: VALUES.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      pain: PAINS.CompanyOne_Minimal,
      name: "Partially Updated name",
      description: "Partially Updated description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: valueMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(400);
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(400);
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: VALUES.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(400);
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: VALUES.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          pain: {
            data: {
              type: painMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(400);
  });

  it(`PUT /${valueMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateValue = {
      data: {
        type: valueMeta.endpoint,
        id: VALUES.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          pain: {
            data: {
              type: "wrong-type",
              id: PAINS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${valueMeta.endpoint}/${VALUES.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateValue)
      .expect(400);
  });

});