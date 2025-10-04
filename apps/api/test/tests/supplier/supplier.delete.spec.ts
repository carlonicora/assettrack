import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import request from "supertest";
import { SUPPLIERS } from "test/data/fixtures/supplier";
import { testState } from "../../setup/test-state";

describe(`DELETE /${supplierMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${supplierMeta.endpoint}/:supplierId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).delete(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Full.id}`).expect(403);
  });

  it(`DELETE /${supplierMeta.endpoint}/:supplierId → 403 when user from another company tries to delete a supplier`, async () => {
    await request(app.getHttpServer())
      .delete(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${supplierMeta.endpoint}/:supplierId → 404 when supplier does not exist`, async () => {
    const nonExistentSupplierId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${supplierMeta.endpoint}/${nonExistentSupplierId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${supplierMeta.endpoint}/:supplierId → 204 when authenticated user deletes a supplier`, async () => {
    await request(app.getHttpServer())
      .delete(`/${supplierMeta.endpoint}/${SUPPLIERS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});
