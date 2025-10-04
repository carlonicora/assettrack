import { Injectable, Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { DataModelInterface } from "src/common/interfaces/datamodel.interface";

@Injectable()
export class JsonApiSerialiserFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  create<T extends DataModelInterface<any>>(model: T, params?: any): InstanceType<T["serialiser"]> {
    const SerialiserClass = model.serialiser as Type<InstanceType<T["serialiser"]>>;

    if (!SerialiserClass) {
      throw new Error("Serialiser not found");
    }

    const serialiserService = this.moduleRef.get<InstanceType<T["serialiser"]>>(SerialiserClass, { strict: false });

    if (!serialiserService) {
      throw new Error(`Serialiser service for ${SerialiserClass.name} not found in the container`);
    }

    if (params && "setParams" in serialiserService && typeof serialiserService.setParams === "function") {
      (serialiserService as any).setParams(params);
    }

    return serialiserService;
  }
}
