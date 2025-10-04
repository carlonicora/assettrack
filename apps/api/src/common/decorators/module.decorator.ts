import { SetMetadata } from "@nestjs/common";
import { ModuleId } from "src/foundations/module/enums/module.id";

export type ModuleDefinition = { module: ModuleId; allowVisitors?: boolean };

export const ModuleACL = (params: ModuleDefinition) => SetMetadata("moduleDefinition", params);
