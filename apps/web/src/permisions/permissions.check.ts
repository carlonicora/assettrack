import { ModuleInterface } from "@/features/foundations/module/data/ModuleInterface";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { Action, ModuleWithPermissions } from "@/permisions/types";

export function checkPermissions(params: {
  module: ModuleWithPermissions;
  action: Action;
  data?: any;
  user: UserInterface;
}): boolean {
  const selectedModule = params.user.modules.find((module: ModuleInterface) => module.id === params.module.moduleId);

  if (!selectedModule) return false;
  const permissionConfig = selectedModule.permissions[params.action];

  if (!permissionConfig) return false;
  if (typeof permissionConfig === "boolean") return permissionConfig as boolean;

  if (!params.data) return false;

  try {
    const singlePermissionConfig = permissionConfig.split("|").map((p) => p.trim());

    for (const path of singlePermissionConfig) {
      if (getValueFromPath(params.data, path, params.user.id)) return true;
    }
    return false;
  } catch (error) {
    if (typeof permissionConfig === "string") return getValueFromPath(params.data, permissionConfig, params.user.id);
  }

  return false;
}

export function checkPermissionsFromServer(params: {
  module: ModuleWithPermissions;
  action: Action;
  data?: any;
  userId: string;
  selectedModule?: {
    id: string;
    permissions: {
      create: boolean | string;
      read: boolean | string;
      update: boolean | string;
      delete: boolean | string;
    };
  };
}): boolean {
  if (!params.selectedModule) return false;
  const permissionConfig = params.selectedModule.permissions[params.action];

  if (!permissionConfig) return false;
  if (typeof permissionConfig === "boolean") return permissionConfig as boolean;

  if (!params.data) return false;

  try {
    const singlePermissionConfig = permissionConfig.split("|").map((p) => p.trim());

    for (const path of singlePermissionConfig) {
      if (getValueFromPath(params.data, path, params.userId)) return true;
    }
    return false;
  } catch (error) {
    if (typeof permissionConfig === "string") return getValueFromPath(params.data, permissionConfig, params.userId);
  }

  return false;
}

export function getValueFromPath(obj: any, path: string, userId: string): any {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (!current) return false;

    if (Array.isArray(current)) {
      let found = false;
      for (const item of current) {
        const result = getValueFromPath(item, parts.slice(parts.indexOf(part)).join("."), userId);
        if (result === userId || result === true) {
          found = true;
          break;
        }
      }
      return found;
    } else if (current[part] !== undefined) {
      current = current[part];
    } else {
      return false;
    }
  }

  if (Array.isArray(current)) {
    // If final value is an array, check if any element has id matching userId
    return current.some((item: any) => {
      if (typeof item === "object" && item.id !== undefined) {
        return item.id.toString() === userId;
      }
      return item.toString() === userId;
    });
  }

  // Direct comparison for primitive values or objects with id
  if (typeof current === "object" && current.id !== undefined) {
    return current.id.toString() === userId;
  }

  return current.toString() === userId;
}
