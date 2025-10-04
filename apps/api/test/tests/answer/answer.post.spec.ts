import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { answerMeta } from "src/features/answer/entities/answer.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { QUESTIONS } from "test/data/fixtures/question";
import { questionMeta } from "src/features/question/entities/question.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${answerMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyQuestionFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyQuestionFixtures = Object.values(QUESTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${answerMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          description: "Test description",
        },
        relationships: {
          question: {
            data: {
              type: questionMeta.endpoint,
              id: companyQuestionFixtures[0].id
            }
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${answerMeta.endpoint}`).send(newAnswer).expect(403);
  });

  it(`POST /${answerMeta.endpoint} → 201 when authenticated user creates a answer`, async () => {

    const newAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          description: "Test description",
        },
        relationships: {
          question: {
            data: {
              type: questionMeta.endpoint,
              id: companyQuestionFixtures[0].id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAnswer)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      question: companyQuestionFixtures[0],
      description: "Test description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: answerMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${answerMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAnswer)
      .expect(400);
  });

  it(`POST /${answerMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAnswer)
      .expect(400);
  });

  it(`POST /${answerMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          description: "Test description",
        },
        relationships: {
          question: {
            data: {
              type: questionMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAnswer)
      .expect(400);
  });

  it(`POST /${answerMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          description: "Test description",
        },
        relationships: {
          question: {
            data: {
              type: questionMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAnswer)
      .expect(400);
  });

  it(`POST /${answerMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyQuestionFixtures = Object.values(QUESTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          description: "Test description",
        },
        relationships: {
          question: {
            data: {
              type: "wrong-type",
              id: companyQuestionFixtures[0].id
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${answerMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newAnswer)
      .expect(400);
  });

});