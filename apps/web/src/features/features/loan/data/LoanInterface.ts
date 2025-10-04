import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";

export type LoanInput = {
  id: string;
  name?: string;
  startDate?: Date;
  endDate?: Date;

  employeeId: string;
  equipmentId: string;
};

export interface LoanInterface extends ApiDataInterface {
  get name(): string;
  get startDate(): Date;
  get endDate(): Date;

  get employee(): EmployeeInterface;
  get equipment(): EquipmentInterface;
}
