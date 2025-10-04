import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";

export type LoanInput = {
  id: string;
  startDate?: Date;
  endDate?: Date | undefined | null;

  employeeId: string;
  equipmentId: string;
};

export interface LoanInterface extends ApiDataInterface {
  get startDate(): Date;
  get endDate(): Date | undefined;

  get employee(): EmployeeInterface;
  get equipment(): EquipmentInterface;
}
