import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Module } from "src/foundations/module/entities/module.entity";
import { mapModule } from "src/foundations/module/entities/module.map";
import { moduleMeta } from "src/foundations/module/entities/module.meta";
import { ModuleSerialiser } from "src/foundations/module/serialisers/module.serialiser";

export const ModuleModel: DataModelInterface<Module> = {
  ...moduleMeta,
  entity: undefined as unknown as Module,
  mapper: mapModule,
  serialiser: ModuleSerialiser,
};
