import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { feeMeta } from "src/features/fee/entities/fee.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { FEES } from "test/data/fixtures/fee";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { STAGES } from "test/data/fixtures/stage";
import { RANGES } from "test/data/fixtures/range";
import { FEES } from "test/data/fixtures/fee";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { stageMeta } from "src/features/stage/entities/stage.meta";
import { rangeMeta } from "src/features/range/entities/range.meta";
import { feeMeta } from "src/features/fee/entities/fee.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${feeMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: FEES.CompanyOne_Full.id,
        attributes: {
          amount: 999,
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyOne_Full.id}`)
      .send(updateFee)
      .expect(403);
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: FEES.CompanyTwo_Full.id,
        attributes: {
          amount: 999,
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: CLASSIFICATIONS.CompanyOne_Full.id
            }
          },
          stage: {
            data: {
              type: stageMeta.endpoint,
              id: STAGES.CompanyOne_Full.id
            }
          },
          range: {
            data: {
              type: rangeMeta.endpoint,
              id: RANGES.CompanyOne_Full.id
            }
          },
          fee: {
            data: {
              type: feeMeta.endpoint,
              id: FEES.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(403);
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          amount: 999,
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: CLASSIFICATIONS.CompanyOne_Full.id
            }
          },
          stage: {
            data: {
              type: stageMeta.endpoint,
              id: STAGES.CompanyOne_Full.id
            }
          },
          range: {
            data: {
              type: rangeMeta.endpoint,
              id: RANGES.CompanyOne_Full.id
            }
          },
          fee: {
            data: {
              type: feeMeta.endpoint,
              id: FEES.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(404);
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: FEES.CompanyOne_Nullable.id,
        attributes: {
          amount: 999,
          isSpecialised: true,
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: CLASSIFICATIONS.CompanyOne_Full.id
            }
          },
          stage: {
            data: {
              type: stageMeta.endpoint,
              id: STAGES.CompanyOne_Full.id
            }
          },
          range: {
            data: {
              type: rangeMeta.endpoint,
              id: RANGES.CompanyOne_Full.id
            }
          },
          fee: {
            data: {
              type: feeMeta.endpoint,
              id: FEES.CompanyOne_Full.id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: FEES.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      classification: CLASSIFICATIONS.CompanyOne_Full,
      stage: STAGES.CompanyOne_Full,
      range: RANGES.CompanyOne_Full,
      fee: FEES.CompanyOne_Full,
      amount: 999,
      isSpecialised: true,
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: FEES.CompanyOne_Minimal.id,
        attributes: {
          amount: 555,
          isSpecialised: true,
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: CLASSIFICATIONS.CompanyOne_Minimal.id
            }
          },
          stage: {
            data: {
              type: stageMeta.endpoint,
              id: STAGES.CompanyOne_Minimal.id
            }
          },
          range: {
            data: {
              type: rangeMeta.endpoint,
              id: RANGES.CompanyOne_Minimal.id
            }
          },
          fee: {
            data: {
              type: feeMeta.endpoint,
              id: FEES.CompanyOne_Minimal.id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: FEES.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      classification: CLASSIFICATIONS.CompanyOne_Minimal,
      stage: STAGES.CompanyOne_Minimal,
      range: RANGES.CompanyOne_Minimal,
      fee: FEES.CompanyOne_Minimal,
      amount: 555,
      isSpecialised: true,
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(400);
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          amount: 999,
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(400);
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: FEES.CompanyOne_Minimal.id,
        attributes: {
          amount: 999,
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          stage: {
            data: {
              type: stageMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          range: {
            data: {
              type: rangeMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          fee: {
            data: {
              type: feeMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(400);
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: FEES.CompanyOne_Full.id,
        attributes: {
          amount: 999,
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          stage: {
            data: {
              type: stageMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          range: {
            data: {
              type: rangeMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          fee: {
            data: {
              type: feeMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(400);
  });

  it(`PUT /${feeMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateFee = {
      data: {
        type: feeMeta.endpoint,
        id: FEES.CompanyTwo_Nullable.id,
        attributes: {
          amount: 999,
        },
        relationships: {
          classification: {
            data: {
              type: "wrong-type",
              id: CLASSIFICATIONS.CompanyOne_Full.id
            }
          },
          stage: {
            data: {
              type: "wrong-type",
              id: STAGES.CompanyOne_Full.id
            }
          },
          range: {
            data: {
              type: "wrong-type",
              id: RANGES.CompanyOne_Full.id
            }
          },
          fee: {
            data: {
              type: "wrong-type",
              id: FEES.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${feeMeta.endpoint}/${FEES.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateFee)
      .expect(400);
  });

});