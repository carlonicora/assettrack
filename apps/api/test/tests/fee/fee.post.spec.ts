import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { feeMeta } from "src/features/fee/entities/fee.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
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

describe(`POST /${feeMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyClassificationFixtures: any[];
  let companyStageFixtures: any[];
  let companyRangeFixtures: any[];
  let companyFeeFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyClassificationFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyStageFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyRangeFixtures = Object.values(RANGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyFeeFixtures = Object.values(FEES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${feeMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newFee = {
      data: {
        type: feeMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          amount: 1,
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: companyClassificationFixtures[0].id
            }
          },
          stage: {
            data: {
              type: stageMeta.endpoint,
              id: companyStageFixtures[0].id
            }
          },
          range: {
            data: {
              type: rangeMeta.endpoint,
              id: companyRangeFixtures[0].id
            }
          },
          fee: {
            data: {
              type: feeMeta.endpoint,
              id: companyFeeFixtures[0].id
            }
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${feeMeta.endpoint}`).send(newFee).expect(403);
  });

  it(`POST /${feeMeta.endpoint} → 201 when authenticated user creates a fee`, async () => {

    const newFee = {
      data: {
        type: feeMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          amount: 1,
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: companyClassificationFixtures[0].id
            }
          },
          stage: {
            data: {
              type: stageMeta.endpoint,
              id: companyStageFixtures[0].id
            }
          },
          range: {
            data: {
              type: rangeMeta.endpoint,
              id: companyRangeFixtures[0].id
            }
          },
          fee: {
            data: {
              type: feeMeta.endpoint,
              id: companyFeeFixtures[0].id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newFee)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      classification: companyClassificationFixtures[0],
      stage: companyStageFixtures[0],
      range: companyRangeFixtures[0],
      fee: companyFeeFixtures[0],
      amount: 1,
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${feeMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newFee = {
      data: {
        type: feeMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newFee)
      .expect(400);
  });

  it(`POST /${feeMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newFee = {
      data: {
        type: feeMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newFee)
      .expect(400);
  });

  it(`POST /${feeMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newFee = {
      data: {
        type: feeMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          amount: 1,
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
      .post(`/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newFee)
      .expect(400);
  });

  it(`POST /${feeMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newFee = {
      data: {
        type: feeMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          amount: 1,
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
      .post(`/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newFee)
      .expect(400);
  });

  it(`POST /${feeMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyClassificationFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyStageFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyRangeFixtures = Object.values(RANGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyFeeFixtures = Object.values(FEES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newFee = {
      data: {
        type: feeMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          amount: 1,
        },
        relationships: {
          classification: {
            data: {
              type: "wrong-type",
              id: companyClassificationFixtures[0].id
            }
          },
          stage: {
            data: {
              type: "wrong-type",
              id: companyStageFixtures[0].id
            }
          },
          range: {
            data: {
              type: "wrong-type",
              id: companyRangeFixtures[0].id
            }
          },
          fee: {
            data: {
              type: "wrong-type",
              id: companyFeeFixtures[0].id
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newFee)
      .expect(400);
  });

});