import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { LoanController } from "src/features/loan/controllers/loan.controller";
import { LoanRepository } from "src/features/loan/repositories/loan.repository";
import { LoanSerialiser } from "src/features/loan/serialisers/loan.serialiser";
import { LoanService } from "src/features/loan/services/loan.service";
import { LoanCypherService } from "src/features/loan/services/loan.cypher.service";
import { LoanModel } from "src/features/loan/entities/loan.model";
import { AuditModule } from "src/foundations/audit/audit.module";

@Module({
  controllers: [LoanController],
  providers: [LoanSerialiser, LoanRepository, LoanService, LoanCypherService],
  exports: [],
  imports: [AuditModule],
})
export class LoanModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(LoanModel);
  }
}
