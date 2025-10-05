import { FeatureIds } from "@/enums/feature.ids";
import { EmployeeModule } from "@/features/features/employee/EmployeeModule";
import { EquipmentModule } from "@/features/features/equipment/EquipmentModule";
import { LoanModule } from "@/features/features/loan/LoanModule";
import { SupplierModule } from "@/features/features/supplier/SupplierModule";
import { AuthModule } from "@/features/foundations/auth/AuthModule";
import { CompanyModule } from "@/features/foundations/company/CompanyModule";
import { FeatureModule } from "@/features/foundations/feature/FeatureModule";
import { ModuleModule } from "@/features/foundations/module/ModuleModule";
import { NotificationModule } from "@/features/foundations/notification/NotificationModule";
import { PushModule } from "@/features/foundations/push/PushModule";
import { RoleModule } from "@/features/foundations/role/RoleModule";
import { S3Module } from "@/features/foundations/s3/S3Module";
import { UserModule } from "@/features/foundations/user/UserModule";
import { FieldSelector } from "@/jsonApi/FieldSelector";
import { ModuleWithPermissions } from "@/permisions/types";
import { AnalyticModule } from "@/features/features/analytic/AnalyticModule";

export class Modules {
  private static _factory(params: {
    pageUrl?: string;
    name: string;
    cache?: string;
    model: any;
    feature?: FeatureIds;
    moduleId?: string;
    inclusions?: Record<string, { types?: string[]; fields?: FieldSelector<any>[] }>;
  }): ModuleWithPermissions {
    return {
      pageUrl: params.pageUrl,
      name: params.name,
      model: params.model,
      feature: params.feature,
      moduleId: params.moduleId,
      cache: params.cache ?? 0,
      inclusions: params.inclusions ?? {},
    } as ModuleWithPermissions;
  }

  static get Auth() {
    return AuthModule(this._factory);
  }

  static get Company() {
    return CompanyModule(this._factory);
  }

  static get Feature() {
    return FeatureModule(this._factory);
  }

  static get Notification() {
    return NotificationModule(this._factory);
  }

  static get Module() {
    return ModuleModule(this._factory);
  }

  static get Push() {
    return PushModule(this._factory);
  }

  static get Role() {
    return RoleModule(this._factory);
  }

  static get S3() {
    return S3Module(this._factory);
  }

  static get User() {
    return UserModule(this._factory);
  }

  static get Supplier() {
    return SupplierModule(this._factory);
  }

  static get Employee() {
    return EmployeeModule(this._factory);
  }

  static get Equipment() {
    return EquipmentModule(this._factory);
  }

  static get Loan() {
    return LoanModule(this._factory);
  }

  static get Analytic() {
      return AnalyticModule(this._factory);
  }

  static findByName(moduleName: string): ModuleWithPermissions {
    const moduleNames = Object.getOwnPropertyNames(Modules).filter(
      (name) =>
        name !== "length" && name !== "name" && name !== "prototype" && name !== "_factory" && name !== "findByName",
    );

    const availableModuleNames: string[] = [];

    for (const name of moduleNames) {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(Modules, name);
        if (descriptor && descriptor.get) {
          const moduleInstance = descriptor.get.call(Modules) as ModuleWithPermissions;
          if (moduleInstance && moduleInstance.name) {
            availableModuleNames.push(moduleInstance.name);
            if (moduleInstance.name === moduleName) {
              return moduleInstance;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error(`Module not found: ${moduleName}`);
  }
}
