import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { AnalyticController } from "src/features/analytic/controllers/analytic.controller";
import { AnalyticModel } from "src/features/analytic/entities/analytic.model";
import { AnalyticSerialiser } from "src/features/analytic/serialisers/analytic.serialiser";
import { AnalyticService } from "src/features/analytic/services/analytic.service";
import { EquipmentModule } from "src/features/equipment/equipment.module";
import { AuditModule } from "src/foundations/audit/audit.module";

@Module({
  controllers: [AnalyticController],
  providers: [AnalyticSerialiser, AnalyticService],
  exports: [],
  imports: [AuditModule, EquipmentModule],
})
export class AnalyticModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(AnalyticModel);
  }
}
