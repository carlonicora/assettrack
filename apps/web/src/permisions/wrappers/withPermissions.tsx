"use client";

import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { Action, ModuleWithPermissions } from "@/permisions/types";
import { ComponentType } from "react";

export default function withPermissions<T extends object, M extends ModuleWithPermissions>(params: {
  Component: ComponentType<T>;
  modules: M[];
  action: Action;
  data?: any;
}) {
  return function WrappedComponent(props: T) {
    const { hasPermissionToModules } = useCurrentUserContext();

    if (!hasPermissionToModules({ modules: params.modules, action: params.action, data: params.data })) {
      return null;
    }

    return <params.Component {...props} />;
  };
}
