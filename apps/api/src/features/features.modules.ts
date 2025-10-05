import { Module } from "@nestjs/common";
import { AnalyticModule } from "src/features/analytic/analytic.module";
import { EmployeeModule } from "src/features/employee/employee.module";
import { EquipmentModule } from "src/features/equipment/equipment.module";
import { LoanModule } from "src/features/loan/loan.module";
import { SupplierModule } from "src/features/supplier/supplier.module";

@Module({
  imports: [AnalyticModule, EmployeeModule, EquipmentModule, LoanModule, SupplierModule],
})
export class FeaturesModules {}
