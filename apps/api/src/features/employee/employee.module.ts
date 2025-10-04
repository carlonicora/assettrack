import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { EmployeeController } from "src/features/employee/controllers/employee.controller";
import { EmployeeRepository } from "src/features/employee/repositories/employee.repository";
import { EmployeeSerialiser } from "src/features/employee/serialisers/employee.serialiser";
import { EmployeeService } from "src/features/employee/services/employee.service";
import { EmployeeCypherService } from "src/features/employee/services/employee.cypher.service";
import { EmployeeModel } from "src/features/employee/entities/employee.model";
import { AuditModule } from "src/foundations/audit/audit.module";

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeSerialiser, EmployeeRepository, EmployeeService, EmployeeCypherService],
  exports: [],
  imports: [AuditModule],
})
export class EmployeeModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(EmployeeModel);
  }
}