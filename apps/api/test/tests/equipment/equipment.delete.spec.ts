import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import request from "supertest";
import { EQUIPMENTS } from "test/data/fixtures/equipment";
import { testState } from "../../setup/test-state";

describe(`DELETE /${equipmentMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`DELETE /${equipmentMeta.endpoint}/:equipmentId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .delete(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`DELETE /${equipmentMeta.endpoint}/:equipmentId → 403 when user from another company tries to delete a equipment`, async () => {
    await request(app.getHttpServer())
      .delete(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.companyTwoToken}`)
      .expect(403);
  });

  it(`DELETE /${equipmentMeta.endpoint}/:equipmentId → 404 when equipment does not exist`, async () => {
    const nonExistentEquipmentId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .delete(`/${equipmentMeta.endpoint}/${nonExistentEquipmentId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`DELETE /${equipmentMeta.endpoint}/:equipmentId → 204 when authenticated user deletes a equipment`, async () => {
    await request(app.getHttpServer())
      .delete(`/${equipmentMeta.endpoint}/${EQUIPMENTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(204);
  });
});