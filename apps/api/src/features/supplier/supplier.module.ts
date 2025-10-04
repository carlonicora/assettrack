import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { SupplierController } from "src/features/supplier/controllers/supplier.controller";
import { SupplierRepository } from "src/features/supplier/repositories/supplier.repository";
import { SupplierSerialiser } from "src/features/supplier/serialisers/supplier.serialiser";
import { SupplierService } from "src/features/supplier/services/supplier.service";
import { SupplierCypherService } from "src/features/supplier/services/supplier.cypher.service";
import { SupplierModel } from "src/features/supplier/entities/supplier.model";
import { AuditModule } from "src/foundations/audit/audit.module";

@Module({
  controllers: [SupplierController],
  providers: [SupplierSerialiser, SupplierRepository, SupplierService, SupplierCypherService],
  exports: [],
  imports: [AuditModule],
})
export class SupplierModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(SupplierModel);
  }
}