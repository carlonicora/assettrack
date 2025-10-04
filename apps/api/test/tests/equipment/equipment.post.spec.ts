import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { SUPPLIERS } from "test/data/fixtures/supplier";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${equipmentMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companySupplierFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companySupplierFixtures = Object.values(SUPPLIERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${equipmentMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: companySupplierFixtures[0].id
            }
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${equipmentMeta.endpoint}`).send(newEquipment).expect(403);
  });

  it(`POST /${equipmentMeta.endpoint} → 201 when authenticated user creates a equipment`, async () => {

    const newEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: companySupplierFixtures[0].id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEquipment)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      supplier: companySupplierFixtures[0],
      name: "Test name",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${equipmentMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEquipment)
      .expect(400);
  });

  it(`POST /${equipmentMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEquipment)
      .expect(400);
  });

  it(`POST /${equipmentMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEquipment)
      .expect(400);
  });

  it(`POST /${equipmentMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEquipment)
      .expect(400);
  });

  it(`POST /${equipmentMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companySupplierFixtures = Object.values(SUPPLIERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          supplier: {
            data: {
              type: "wrong-type",
              id: companySupplierFixtures[0].id
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${equipmentMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newEquipment)
      .expect(400);
  });

});