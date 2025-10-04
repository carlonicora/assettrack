import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`POST /${loanMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  // Centralized company-filtered fixtures for all tests
  let companyEmployeeFixtures: any[];
  let companyEquipmentFixtures: any[];

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;

    // Initialize company-filtered fixtures
    companyEmployeeFixtures = Object.values(EMPLOYEES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    companyEquipmentFixtures = Object.values(EQUIPMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
  });

  it(`POST /${loanMeta.endpoint} → 403 when unauthenticated`, async () => {

    const newLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "11023c1a-2fc5-4207-aecf-1a057db57b5c",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: companyEmployeeFixtures[0].id
            }
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: companyEquipmentFixtures[0].id
            }
          },
        },
      },
    };

    await request(app.getHttpServer()).post(`/${loanMeta.endpoint}`).send(newLoan).expect(403);
  });

  it(`POST /${loanMeta.endpoint} → 201 when authenticated user creates a loan`, async () => {

    const newLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: companyEmployeeFixtures[0].id
            }
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: companyEquipmentFixtures[0].id
            }
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLoan)
      .expect(201);

    // Build expected entity based on the request data
    const expectedEntity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: COMPANIES.CompanyOne,
      employee: companyEmployeeFixtures[0],
      equipment: companyEquipmentFixtures[0],
      name: "Test name",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: loanMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`POST /${loanMeta.endpoint} → 400 when the body is malformed`, async () => {
    const newLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "",
      },
    };
    await request(app.getHttpServer())
      .post(`/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLoan)
      .expect(400);
  });

  it(`POST /${loanMeta.endpoint} → 400 when required fields are missing`, async () => {
    const newLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174001",
        attributes: {
          // Missing required fields
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLoan)
      .expect(400);
  });

  it(`POST /${loanMeta.endpoint} → 400 when relationship ID is invalid UUID`, async () => {
    const newLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174002",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: "invalid-uuid"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLoan)
      .expect(400);
  });

  it(`POST /${loanMeta.endpoint} → 400 when relationship ID does not exist`, async () => {
    const newLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174003",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLoan)
      .expect(400);
  });

  it(`POST /${loanMeta.endpoint} → 400 when relationship type is incorrect`, async () => {
    // Use company-filtered fixtures for relationship IDs
    const companyEmployeeFixtures = Object.values(EMPLOYEES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    const companyEquipmentFixtures = Object.values(EQUIPMENTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);

    const newLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "123e4567-e89b-12d3-a456-426614174004",
        attributes: {
          name: "Test name",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: "wrong-type",
              id: companyEmployeeFixtures[0].id
            }
          },
          equipment: {
            data: {
              type: "wrong-type",
              id: companyEquipmentFixtures[0].id
            }
          },
        },
      },
    };
    await request(app.getHttpServer())
      .post(`/${loanMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(newLoan)
      .expect(400);
  });

});