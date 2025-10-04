import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { JsonApiModule } from "src/core/jsonapi/jsonapi.module";
import { AuditController } from "src/foundations/audit/controllers/audit.controller";
import { auditModel } from "src/foundations/audit/entities/audit.model";
import { AuditRepository } from "src/foundations/audit/repositories/audit.repository";
import { AuditSerialiser } from "src/foundations/audit/serialisers/audit.serialiser";
import { AuditService } from "src/foundations/audit/services/audit.service";
import { UserModule } from "src/foundations/user/user.module";

@Module({
  imports: [JsonApiModule, UserModule],
  controllers: [AuditController],
  providers: [AuditSerialiser, AuditService, AuditRepository],
  exports: [AuditService],
})
export class AuditModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(auditModel);
  }
}
