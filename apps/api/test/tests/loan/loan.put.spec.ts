import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { LOANS } from "test/data/fixtures/loan";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${loanMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: LOANS.CompanyOne_Full.id,
        attributes: {
          startDate: new Date().toISOString(),
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Full.id}`)
      .send(updateLoan)
      .expect(403);
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: LOANS.CompanyTwo_Full.id,
        attributes: {
          startDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: EMPLOYEES.CompanyOne_Full.id,
            },
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: EQUIPMENTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(403);
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          startDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: EMPLOYEES.CompanyOne_Full.id,
            },
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: EQUIPMENTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(404);
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: LOANS.CompanyOne_Nullable.id,
        attributes: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: EMPLOYEES.CompanyOne_Full.id,
            },
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: EQUIPMENTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: LOANS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      employee: EMPLOYEES.CompanyOne_Full,
      equipment: EQUIPMENTS.CompanyOne_Full,
      startDate: updateLoan.data.attributes.startDate,
      endDate: updateLoan.data.attributes.endDate,
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: loanMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: LOANS.CompanyOne_Minimal.id,
        attributes: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: EMPLOYEES.CompanyOne_Minimal.id,
            },
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: EQUIPMENTS.CompanyOne_Minimal.id,
            },
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: LOANS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      employee: EMPLOYEES.CompanyOne_Minimal,
      equipment: EQUIPMENTS.CompanyOne_Minimal,
      startDate: updateLoan.data.attributes.startDate,
      endDate: updateLoan.data.attributes.endDate,
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: loanMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(400);
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          startDate: new Date().toISOString(),
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(400);
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: LOANS.CompanyOne_Minimal.id,
        attributes: {
          startDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: "invalid-uuid",
            },
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: "invalid-uuid",
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(400);
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: LOANS.CompanyOne_Full.id,
        attributes: {
          startDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: employeeMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000",
            },
          },
          equipment: {
            data: {
              type: equipmentMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000",
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(400);
  });

  it(`PUT /${loanMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateLoan = {
      data: {
        type: loanMeta.endpoint,
        id: LOANS.CompanyTwo_Nullable.id,
        attributes: {
          startDate: new Date().toISOString(),
        },
        relationships: {
          employee: {
            data: {
              type: "wrong-type",
              id: EMPLOYEES.CompanyOne_Full.id,
            },
          },
          equipment: {
            data: {
              type: "wrong-type",
              id: EQUIPMENTS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${loanMeta.endpoint}/${LOANS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateLoan)
      .expect(400);
  });
});
