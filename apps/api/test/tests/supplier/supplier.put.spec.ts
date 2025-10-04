import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { SUPPLIERS } from "test/data/fixtures/supplier";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${supplierMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${supplierMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateSupplier = {
      data: {
        type: supplierMeta.endpoint,
        id: SUPPLIERS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Full.id}`)
      .send(updateSupplier)
      .expect(403);
  });

  it(`PUT /${supplierMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateSupplier = {
      data: {
        type: supplierMeta.endpoint,
        id: SUPPLIERS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateSupplier)
      .expect(403);
  });

  it(`PUT /${supplierMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateSupplier = {
      data: {
        type: supplierMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${supplierMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateSupplier)
      .expect(404);
  });

  it(`PUT /${supplierMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateSupplier = {
      data: {
        type: supplierMeta.endpoint,
        id: SUPPLIERS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          address: "Updated address",
          email: "Updated email",
          phone: "Updated phone",
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateSupplier)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: SUPPLIERS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      name: "Updated name",
      address: "Updated address",
      email: "Updated email",
      phone: "Updated phone",
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: supplierMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${supplierMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateSupplier = {
      data: {
        type: supplierMeta.endpoint,
        id: SUPPLIERS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          address: "Partially Updated address",
          email: "Partially Updated email",
          phone: "Partially Updated phone",
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateSupplier)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: SUPPLIERS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      name: "Partially Updated name",
      address: "Partially Updated address",
      email: "Partially Updated email",
      phone: "Partially Updated phone",
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: supplierMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${supplierMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateSupplier = {
      data: {
        type: supplierMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateSupplier)
      .expect(400);
  });

  it(`PUT /${supplierMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateSupplier = {
      data: {
        type: supplierMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateSupplier)
      .expect(400);
  });
});
