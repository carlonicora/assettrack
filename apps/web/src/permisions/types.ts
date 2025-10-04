// In @/permissions/types.ts
import { FeatureIds } from "@/enums/feature.ids";
import { UseTableStructureHook } from "@/features/common/interfaces/table.structure.generator.interface";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { FieldSelector } from "@/jsonApi/FieldSelector";
import { ApiRequestDataTypeInterface } from "@/jsonApi/interfaces/ApiRequestDataTypeInterface";

export enum Action {
  Read = "read",
  Create = "create",
  Update = "update",
  Delete = "delete",
}

// Basic permission check type
export type PermissionCheck<T> = boolean | ((user?: UserInterface | string, data?: T) => boolean);

// 1. Basic types first
export type PageUrl = {
  pageUrl?: string;
};

export type ModulePermissionDefinition<T> = {
  interface: T;
};

// 3. Module definition
export type ModuleDefinition = {
  pageUrl?: string;
  name: string;
  model: any;
  feature?: FeatureIds;
  moduleId?: string;
};

// 4. Module with permissions
export type ModuleWithPermissions = ApiRequestDataTypeInterface &
  PageUrl & {
    name: string;
    model: any;
    cache: string | undefined;
    feature: FeatureIds;
    moduleId: string;
    inclusions: Record<
      string,
      {
        types?: string[];
        fields?: FieldSelector<any>[];
      }
    >;
  };

export type FactoryType = (params: {
  pageUrl?: string;
  name: string;
  cache?: string | "days" | "default" | "hours" | "max" | "minutes" | "seconds" | "weeks";
  model: any;
  feature?: FeatureIds;
  moduleId?: string;
  inclusions?: Record<
    string,
    {
      types?: string[];
      fields?: FieldSelector<any>[];
    }
  >;
  tableGenerator?: UseTableStructureHook<any, any>;
}) => ModuleWithPermissions;
