import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { CacheModule } from "src/core/cache/cache.module";
import { EquipmentController } from "src/features/equipment/controllers/equipment.controller";
import { EquipmentModel } from "src/features/equipment/entities/equipment.model";
import { EquipmentRepository } from "src/features/equipment/repositories/equipment.repository";
import { EquipmentSerialiser } from "src/features/equipment/serialisers/equipment.serialiser";
import { EquipmentCypherService } from "src/features/equipment/services/equipment.cypher.service";
import { EquipmentMetadataService } from "src/features/equipment/services/equipment.metadata.service";
import { EquipmentService } from "src/features/equipment/services/equipment.service";
import { AuditModule } from "src/foundations/audit/audit.module";

@Module({
  controllers: [EquipmentController],
  providers: [
    EquipmentSerialiser,
    EquipmentRepository,
    EquipmentService,
    EquipmentCypherService,
    EquipmentMetadataService,
  ],
  exports: [EquipmentRepository],
  imports: [AuditModule, CacheModule],
})
export class EquipmentModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(EquipmentModel);
  }
}
