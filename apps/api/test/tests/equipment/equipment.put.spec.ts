import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { EQUIPMENTS } from "test/data/fixtures/equipment";
import { SUPPLIERS } from "test/data/fixtures/supplier";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${equipmentMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: EQUIPMENTS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          startDate: new Date().toISOString(),
          status: "Updated status",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Full.id}`)
      .send(updateEquipment)
      .expect(403);
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: EQUIPMENTS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          startDate: new Date().toISOString(),
          status: "Updated status",
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: SUPPLIERS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(403);
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          startDate: new Date().toISOString(),
          status: "Updated status",
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: SUPPLIERS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(404);
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: EQUIPMENTS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          barcode: "Updated barcode",
          description: "Updated description",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          status: "Updated status",
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: SUPPLIERS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: EQUIPMENTS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      supplier: SUPPLIERS.CompanyOne_Full,
      name: "Updated name",
      barcode: "Updated barcode",
      description: "Updated description",
      startDate: updateEquipment.data.attributes.startDate,
      endDate: updateEquipment.data.attributes.endDate,
      status: "Updated status",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: EQUIPMENTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          barcode: "Partially Updated barcode",
          description: "Partially Updated description",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          status: "Partially Updated status",
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: SUPPLIERS.CompanyOne_Minimal.id,
            },
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: EQUIPMENTS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      supplier: SUPPLIERS.CompanyOne_Minimal,
      name: "Partially Updated name",
      barcode: "Partially Updated barcode",
      description: "Partially Updated description",
      startDate: updateEquipment.data.attributes.startDate,
      endDate: updateEquipment.data.attributes.endDate,
      status: "Partially Updated status",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: equipmentMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(400);
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          startDate: new Date().toISOString(),
          status: "Updated status",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(400);
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: EQUIPMENTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          startDate: new Date().toISOString(),
          status: "Updated status",
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: "invalid-uuid",
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(400);
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: EQUIPMENTS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          startDate: new Date().toISOString(),
          status: "Updated status",
        },
        relationships: {
          supplier: {
            data: {
              type: supplierMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000",
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(400);
  });

  it(`PUT /${equipmentMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateEquipment = {
      data: {
        type: equipmentMeta.endpoint,
        id: EQUIPMENTS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          startDate: new Date().toISOString(),
          status: "Updated status",
        },
        relationships: {
          supplier: {
            data: {
              type: "wrong-type",
              id: SUPPLIERS.CompanyOne_Full.id,
            },
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateEquipment)
      .expect(400);
  });
});
