import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { answerMeta } from "src/features/answer/entities/answer.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { ANSWERS } from "test/data/fixtures/answer";
import { QUESTIONS } from "test/data/fixtures/question";
import { questionMeta } from "src/features/question/entities/question.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${answerMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: ANSWERS.CompanyOne_Full.id,
        attributes: {
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Full.id}`)
      .send(updateAnswer)
      .expect(403);
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: ANSWERS.CompanyTwo_Full.id,
        attributes: {
          description: "Updated description",
        },
        relationships: {
          question: {
            data: {
              type: questionMeta.endpoint,
              id: QUESTIONS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(403);
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          description: "Updated description",
        },
        relationships: {
          question: {
            data: {
              type: questionMeta.endpoint,
              id: QUESTIONS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${answerMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(404);
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: ANSWERS.CompanyOne_Nullable.id,
        attributes: {
          description: "Updated description",
        },
        relationships: {
          question: {
            data: {
              type: questionMeta.endpoint,
              id: QUESTIONS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: ANSWERS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      question: QUESTIONS.CompanyOne_Full,
      description: "Updated description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: answerMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: ANSWERS.CompanyOne_Minimal.id,
        attributes: {
          description: "Partially Updated description",
        },
        relationships: {
          question: {
            data: {
              type: questionMeta.endpoint,
              id: QUESTIONS.CompanyOne_Minimal.id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: ANSWERS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      question: QUESTIONS.CompanyOne_Minimal,
      description: "Partially Updated description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: answerMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(400);
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          description: "Updated description",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(400);
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: ANSWERS.CompanyOne_Minimal.id,
        attributes: {
          description: "Updated description",
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
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(400);
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: ANSWERS.CompanyOne_Full.id,
        attributes: {
          description: "Updated description",
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
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(400);
  });

  it(`PUT /${answerMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateAnswer = {
      data: {
        type: answerMeta.endpoint,
        id: ANSWERS.CompanyTwo_Nullable.id,
        attributes: {
          description: "Updated description",
        },
        relationships: {
          question: {
            data: {
              type: "wrong-type",
              id: QUESTIONS.CompanyOne_Full.id
            }
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${answerMeta.endpoint}/${ANSWERS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateAnswer)
      .expect(400);
  });

});