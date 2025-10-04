import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { opportunityMeta } from "src/features/opportunity/entities/opportunity.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { OPPORTUNITYS } from "test/data/fixtures/opportunity";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { STAGES } from "test/data/fixtures/stage";
import { ACCOUNTS } from "test/data/fixtures/account";
import { PERSONS } from "test/data/fixtures/person";
import { PIPELINES } from "test/data/fixtures/pipeline";
import { ANSWERS } from "test/data/fixtures/answer";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { PAINS } from "test/data/fixtures/pain";
import { VALUES } from "test/data/fixtures/value";
import { OBJECTIONS } from "test/data/fixtures/objection";
import { REBUTTALS } from "test/data/fixtures/rebuttal";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { stageMeta } from "src/features/stage/entities/stage.meta";
import { accountMeta } from "src/features/account/entities/account.meta";
import { personMeta } from "src/features/person/entities/person.meta";
import { pipelineMeta } from "src/features/pipeline/entities/pipeline.meta";
import { answerMeta } from "src/features/answer/entities/answer.meta";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { painMeta } from "src/features/pain/entities/pain.meta";
import { valueMeta } from "src/features/value/entities/value.meta";
import { objectionMeta } from "src/features/objection/entities/objection.meta";
import { rebuttalMeta } from "src/features/rebuttal/entities/rebuttal.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${opportunityMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Full.id}`)
      .send(updateOpportunity)
      .expect(403);
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Full.id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: PERSONS.CompanyOne_Full.id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: PIPELINES.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(403);
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Full.id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: PERSONS.CompanyOne_Full.id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: PIPELINES.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(404);
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          classification: {
            data: null
          },
          stages: {
            data: []
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Full.id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: PERSONS.CompanyOne_Full.id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: PIPELINES.CompanyOne_Full.id
            }
          },
          answers: {
            data: []
          },
          proceeding: {
            data: null
          },
          pains: {
            data: []
          },
          values: {
            data: []
          },
          objections: {
            data: []
          },
          rebuttals: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: OPPORTUNITYS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      classification: null,
      stages: [],
      account: ACCOUNTS.CompanyOne_Full,
      person: PERSONS.CompanyOne_Full,
      pipeline: PIPELINES.CompanyOne_Full,
      answers: [],
      proceeding: null,
      pains: [],
      values: [],
      objections: [],
      rebuttals: [],
      name: "Updated name",
      description: "Updated description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          description: "Partially Updated description",
        },
        relationships: {
          classification: {
            data: null
          },
          stages: {
            data: []
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Minimal.id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: PERSONS.CompanyOne_Minimal.id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: PIPELINES.CompanyOne_Minimal.id
            }
          },
          answers: {
            data: []
          },
          proceeding: {
            data: null
          },
          pains: {
            data: []
          },
          values: {
            data: []
          },
          objections: {
            data: []
          },
          rebuttals: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: OPPORTUNITYS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      classification: null,
      stages: [],
      account: ACCOUNTS.CompanyOne_Minimal,
      person: PERSONS.CompanyOne_Minimal,
      pipeline: PIPELINES.CompanyOne_Minimal,
      answers: [],
      proceeding: null,
      pains: [],
      values: [],
      objections: [],
      rebuttals: [],
      name: "Partially Updated name",
      description: "Partially Updated description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(400);
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(400);
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          stages: {
            data: [{
              type: stageMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          answers: {
            data: [{
              type: answerMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          pains: {
            data: [{
              type: painMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
          values: {
            data: [{
              type: valueMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
          objections: {
            data: [{
              type: objectionMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
          rebuttals: {
            data: [{
              type: rebuttalMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(400);
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          stages: {
            data: [{
              type: stageMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          answers: {
            data: [{
              type: answerMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          pains: {
            data: [{
              type: painMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
          values: {
            data: [{
              type: valueMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
          objections: {
            data: [{
              type: objectionMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
          rebuttals: {
            data: [{
              type: rebuttalMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(400);
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          description: "Updated description",
        },
        relationships: {
          classification: {
            data: {
              type: "wrong-type",
              id: CLASSIFICATIONS.CompanyOne_Full.id
            }
          },
          stages: {
            data: [{
              type: "wrong-type",
              id: STAGES.CompanyOne_Full.id
            }]
          },
          account: {
            data: {
              type: "wrong-type",
              id: ACCOUNTS.CompanyOne_Full.id
            }
          },
          person: {
            data: {
              type: "wrong-type",
              id: PERSONS.CompanyOne_Full.id
            }
          },
          pipeline: {
            data: {
              type: "wrong-type",
              id: PIPELINES.CompanyOne_Full.id
            }
          },
          answers: {
            data: [{
              type: "wrong-type",
              id: ANSWERS.CompanyOne_Full.id
            }]
          },
          proceeding: {
            data: {
              type: "wrong-type",
              id: PROCEEDINGS.CompanyOne_Full.id
            }
          },
          pains: {
            data: [{
              type: "wrong-type",
              id: PAINS.CompanyOne_Full.id
            }]
          },
          values: {
            data: [{
              type: "wrong-type",
              id: VALUES.CompanyOne_Full.id
            }]
          },
          objections: {
            data: [{
              type: "wrong-type",
              id: OBJECTIONS.CompanyOne_Full.id
            }]
          },
          rebuttals: {
            data: [{
              type: "wrong-type",
              id: REBUTTALS.CompanyOne_Full.id
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(400);
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated Multiple name",
          description: "Updated Multiple description",
        },
        relationships: {
          classification: {
            data: null
          },
          stages: {
            data: [
              {
                type: stageMeta.endpoint,
                id: STAGES.CompanyOne_Full.id
              },
              {
                type: stageMeta.endpoint,
                id: STAGES.CompanyOne_Nullable.id
              }
            ]
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Full.id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: PERSONS.CompanyOne_Full.id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: PIPELINES.CompanyOne_Full.id
            }
          },
          answers: {
            data: [
              {
                type: answerMeta.endpoint,
                id: ANSWERS.CompanyOne_Full.id
              },
              {
                type: answerMeta.endpoint,
                id: ANSWERS.CompanyOne_Nullable.id
              }
            ]
          },
          proceeding: {
            data: null
          },
          pains: {
            data: [
              {
                type: painMeta.endpoint,
                id: PAINS.CompanyOne_Full.id
              },
              {
                type: painMeta.endpoint,
                id: PAINS.CompanyOne_Nullable.id
              }
            ]
          },
          values: {
            data: [
              {
                type: valueMeta.endpoint,
                id: VALUES.CompanyOne_Full.id
              },
              {
                type: valueMeta.endpoint,
                id: VALUES.CompanyOne_Nullable.id
              }
            ]
          },
          objections: {
            data: [
              {
                type: objectionMeta.endpoint,
                id: OBJECTIONS.CompanyOne_Full.id
              },
              {
                type: objectionMeta.endpoint,
                id: OBJECTIONS.CompanyOne_Nullable.id
              }
            ]
          },
          rebuttals: {
            data: [
              {
                type: rebuttalMeta.endpoint,
                id: REBUTTALS.CompanyOne_Full.id
              },
              {
                type: rebuttalMeta.endpoint,
                id: REBUTTALS.CompanyOne_Nullable.id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: OPPORTUNITYS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      classification: null,
      stages: [STAGES.CompanyOne_Full, STAGES.CompanyOne_Nullable],
      account: ACCOUNTS.CompanyOne_Full,
      person: PERSONS.CompanyOne_Full,
      pipeline: PIPELINES.CompanyOne_Full,
      answers: [ANSWERS.CompanyOne_Full, ANSWERS.CompanyOne_Nullable],
      proceeding: null,
      pains: [PAINS.CompanyOne_Full, PAINS.CompanyOne_Nullable],
      values: [VALUES.CompanyOne_Full, VALUES.CompanyOne_Nullable],
      objections: [OBJECTIONS.CompanyOne_Full, OBJECTIONS.CompanyOne_Nullable],
      rebuttals: [REBUTTALS.CompanyOne_Full, REBUTTALS.CompanyOne_Nullable],
      name: "Updated Multiple name",
      description: "Updated Multiple description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${opportunityMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updateOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: OPPORTUNITYS.CompanyOne_Full.id,
        attributes: {
          name: "Cleared Relationships name",
          description: "Cleared Relationships name",
        },
        relationships: {
          classification: {
            data: null
          },
          stages: {
            data: []
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: ACCOUNTS.CompanyOne_Minimal.id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: PERSONS.CompanyOne_Minimal.id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: PIPELINES.CompanyOne_Minimal.id
            }
          },
          answers: {
            data: []
          },
          proceeding: {
            data: null
          },
          pains: {
            data: []
          },
          values: {
            data: []
          },
          objections: {
            data: []
          },
          rebuttals: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateOpportunity)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: OPPORTUNITYS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      classification: null,
      stages: [],
      account: ACCOUNTS.CompanyOne_Minimal,
      person: PERSONS.CompanyOne_Minimal,
      pipeline: PIPELINES.CompanyOne_Minimal,
      answers: [],
      proceeding: null,
      pains: [],
      values: [],
      objections: [],
      rebuttals: [],
      name: "Cleared Relationships name",
      description: "Cleared Relationships name",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedEntity,
    });
  });
});