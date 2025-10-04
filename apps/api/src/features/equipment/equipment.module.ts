import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { EquipmentController } from "src/features/equipment/controllers/equipment.controller";
import { EquipmentRepository } from "src/features/equipment/repositories/equipment.repository";
import { EquipmentSerialiser } from "src/features/equipment/serialisers/equipment.serialiser";
import { EquipmentService } from "src/features/equipment/services/equipment.service";
import { EquipmentCypherService } from "src/features/equipment/services/equipment.cypher.service";
import { EquipmentModel } from "src/features/equipment/entities/equipment.model";
import { AuditModule } from "src/foundations/audit/audit.module";

@Module({
  controllers: [EquipmentController],
  providers: [EquipmentSerialiser, EquipmentRepository, EquipmentService, EquipmentCypherService],
  exports: [],
  imports: [AuditModule],
})
export class EquipmentModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(EquipmentModel);
  }
}