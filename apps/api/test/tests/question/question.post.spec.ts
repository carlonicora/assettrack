import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { questionMeta } from "src/features/question/entities/question.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${questionMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyClassificationFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyClassificationFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${questionMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newQuestion = {
      data: {
        type: questionMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          classifications: {
            data: []
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${questionMeta.endpoint}`).send(newQuestion).expect(403);
  });

  it(`POST /${questionMeta.endpoint} → 201 when authenticated user creates a question`, async () => {

    const newQuestion = {
      data: {
        type: questionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          classifications: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newQuestion)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      classifications: [],
      name: "Test name",
      description: "Test description",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: questionMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${questionMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newQuestion = {
      data: {
        type: questionMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newQuestion)
      .expect(400);
  });

  it(`POST /${questionMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newQuestion = {
      data: {
        type: questionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newQuestion)
      .expect(400);
  });

  it(`POST /${questionMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newQuestion = {
      data: {
        type: questionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          description: "Test description",
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
      .post(`/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newQuestion)
      .expect(400);
  });

  it(`POST /${questionMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newQuestion = {
      data: {
        type: questionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          description: "Test description",
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
      .post(`/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newQuestion)
      .expect(400);
  });

  it(`POST /${questionMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyClassificationFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newQuestion = {
      data: {
        type: questionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          description: "Test description",
        },
        relationships: {
          classifications: {
            data: [{
              type: "wrong-type",
              id: companyClassificationFixtures[0].id
            }]
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newQuestion)
      .expect(400);
  });

  it(`POST /${questionMeta.endpoint} → 201 when creating with populated relationship arrays`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyClassificationFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newQuestion = {
      data: {
        type: questionMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174005",
        attributes: {
          name: "Test Multiple Relationships name",
          description: "Test Multiple Relationships description",
        },
        relationships: {
          classifications: {
            data: [
              {
                type: classificationMeta.endpoint,
                id: companyClassificationFixtures[0].id
              },
              {
                type: classificationMeta.endpoint,
                id: companyClassificationFixtures[1]?.id || companyClassificationFixtures[0].id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${questionMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newQuestion)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174005",
      company: COMPANIES.CompanyOne,
      classifications: [companyClassificationFixtures[0], companyClassificationFixtures[1] || companyClassificationFixtures[0]],
      name: "Test Multiple Relationships name",
      description: "Test Multiple Relationships description",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: questionMeta.endpoint,
      expected: expectedEntity,
    });
  });

});