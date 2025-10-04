import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { opportunityMeta } from "src/features/opportunity/entities/opportunity.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
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

describe(`POST /${opportunityMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyClassificationFixtures: any[];
  let companyStageFixtures: any[];
  let companyAccountFixtures: any[];
  let companyPersonFixtures: any[];
  let companyPipelineFixtures: any[];
  let companyAnswerFixtures: any[];
  let companyProceedingFixtures: any[];
  let companyPainFixtures: any[];
  let companyValueFixtures: any[];
  let companyObjectionFixtures: any[];
  let companyRebuttalFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyClassificationFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyStageFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyPersonFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyPipelineFixtures = Object.values(PIPELINES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyAnswerFixtures = Object.values(ANSWERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyPainFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyValueFixtures = Object.values(VALUES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyObjectionFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyRebuttalFixtures = Object.values(REBUTTALS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: companyClassificationFixtures[0].id
            }
          },
          stages: {
            data: []
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: companyAccountFixtures[0].id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: companyPersonFixtures[0].id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: companyPipelineFixtures[0].id
            }
          },
          answers: {
            data: []
          },
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: companyProceedingFixtures[0].id
            }
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

    await request(app.getHttpServer()).post(`/${opportunityMeta.endpoint}`).send(newOpportunity).expect(403);
  });

  it(`POST /${opportunityMeta.endpoint} → 201 when authenticated user creates a opportunity`, async () => {

    const newOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: companyClassificationFixtures[0].id
            }
          },
          stages: {
            data: []
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: companyAccountFixtures[0].id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: companyPersonFixtures[0].id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: companyPipelineFixtures[0].id
            }
          },
          answers: {
            data: []
          },
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: companyProceedingFixtures[0].id
            }
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
      .post(`/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newOpportunity)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      classification: companyClassificationFixtures[0],
      stages: [],
      account: companyAccountFixtures[0],
      person: companyPersonFixtures[0],
      pipeline: companyPipelineFixtures[0],
      answers: [],
      proceeding: companyProceedingFixtures[0],
      pains: [],
      values: [],
      objections: [],
      rebuttals: [],
      name: "Test name",
      description: "Test description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${opportunityMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newOpportunity)
      .expect(400);
  });

  it(`POST /${opportunityMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newOpportunity)
      .expect(400);
  });

  it(`POST /${opportunityMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          description: "Test description",
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
      .post(`/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newOpportunity)
      .expect(400);
  });

  it(`POST /${opportunityMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          description: "Test description",
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
      .post(`/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newOpportunity)
      .expect(400);
  });

  it(`POST /${opportunityMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyClassificationFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyStageFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyPersonFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyPipelineFixtures = Object.values(PIPELINES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyAnswerFixtures = Object.values(ANSWERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyPainFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyValueFixtures = Object.values(VALUES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyObjectionFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyRebuttalFixtures = Object.values(REBUTTALS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          classification: {
            data: {
              type: "wrong-type",
              id: companyClassificationFixtures[0].id
            }
          },
          stages: {
            data: [{
              type: "wrong-type",
              id: companyStageFixtures[0].id
            }]
          },
          account: {
            data: {
              type: "wrong-type",
              id: companyAccountFixtures[0].id
            }
          },
          person: {
            data: {
              type: "wrong-type",
              id: companyPersonFixtures[0].id
            }
          },
          pipeline: {
            data: {
              type: "wrong-type",
              id: companyPipelineFixtures[0].id
            }
          },
          answers: {
            data: [{
              type: "wrong-type",
              id: companyAnswerFixtures[0].id
            }]
          },
          proceeding: {
            data: {
              type: "wrong-type",
              id: companyProceedingFixtures[0].id
            }
          },
          pains: {
            data: [{
              type: "wrong-type",
              id: companyPainFixtures[0].id
            }]
          },
          values: {
            data: [{
              type: "wrong-type",
              id: companyValueFixtures[0].id
            }]
          },
          objections: {
            data: [{
              type: "wrong-type",
              id: companyObjectionFixtures[0].id
            }]
          },
          rebuttals: {
            data: [{
              type: "wrong-type",
              id: companyRebuttalFixtures[0].id
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newOpportunity)
      .expect(400);
  });

  it(`POST /${opportunityMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyClassificationFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyStageFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyAccountFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyPersonFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyPipelineFixtures = Object.values(PIPELINES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyAnswerFixtures = Object.values(ANSWERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyProceedingFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyPainFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyValueFixtures = Object.values(VALUES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyObjectionFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyRebuttalFixtures = Object.values(REBUTTALS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newOpportunity = {
      data: {
        type: opportunityMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          name: "Test Multiple Relationships name",
          description: "Test Multiple Relationships description",
        },
        relationships: {
          classification: {
            data: {
              type: classificationMeta.endpoint,
              id: companyClassificationFixtures[0].id
            }
          },
          stages: {
            data: [
              {
                type: stageMeta.endpoint,
                id: companyStageFixtures[0].id
              },
              {
                type: stageMeta.endpoint,
                id: companyStageFixtures[1]?.id || companyStageFixtures[0].id
              }
            ]
          },
          account: {
            data: {
              type: accountMeta.endpoint,
              id: companyAccountFixtures[0].id
            }
          },
          person: {
            data: {
              type: personMeta.endpoint,
              id: companyPersonFixtures[0].id
            }
          },
          pipeline: {
            data: {
              type: pipelineMeta.endpoint,
              id: companyPipelineFixtures[0].id
            }
          },
          answers: {
            data: [
              {
                type: answerMeta.endpoint,
                id: companyAnswerFixtures[0].id
              },
              {
                type: answerMeta.endpoint,
                id: companyAnswerFixtures[1]?.id || companyAnswerFixtures[0].id
              }
            ]
          },
          proceeding: {
            data: {
              type: proceedingMeta.endpoint,
              id: companyProceedingFixtures[0].id
            }
          },
          pains: {
            data: [
              {
                type: painMeta.endpoint,
                id: companyPainFixtures[0].id
              },
              {
                type: painMeta.endpoint,
                id: companyPainFixtures[1]?.id || companyPainFixtures[0].id
              }
            ]
          },
          values: {
            data: [
              {
                type: valueMeta.endpoint,
                id: companyValueFixtures[0].id
              },
              {
                type: valueMeta.endpoint,
                id: companyValueFixtures[1]?.id || companyValueFixtures[0].id
              }
            ]
          },
          objections: {
            data: [
              {
                type: objectionMeta.endpoint,
                id: companyObjectionFixtures[0].id
              },
              {
                type: objectionMeta.endpoint,
                id: companyObjectionFixtures[1]?.id || companyObjectionFixtures[0].id
              }
            ]
          },
          rebuttals: {
            data: [
              {
                type: rebuttalMeta.endpoint,
                id: companyRebuttalFixtures[0].id
              },
              {
                type: rebuttalMeta.endpoint,
                id: companyRebuttalFixtures[1]?.id || companyRebuttalFixtures[0].id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newOpportunity)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      classification: companyClassificationFixtures[0],
      stages: [companyStageFixtures[0], companyStageFixtures[1] || companyStageFixtures[0]],
      account: companyAccountFixtures[0],
      person: companyPersonFixtures[0],
      pipeline: companyPipelineFixtures[0],
      answers: [companyAnswerFixtures[0], companyAnswerFixtures[1] || companyAnswerFixtures[0]],
      proceeding: companyProceedingFixtures[0],
      pains: [companyPainFixtures[0], companyPainFixtures[1] || companyPainFixtures[0]],
      values: [companyValueFixtures[0], companyValueFixtures[1] || companyValueFixtures[0]],
      objections: [companyObjectionFixtures[0], companyObjectionFixtures[1] || companyObjectionFixtures[0]],
      rebuttals: [companyRebuttalFixtures[0], companyRebuttalFixtures[1] || companyRebuttalFixtures[0]],
      name: "Test Multiple Relationships name",
      description: "Test Multiple Relationships description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedEntity,
    });
  });

});