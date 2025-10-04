"use client";

import LandingComponent from "@/features/foundations/auth/components/details/LandingComponent";
import AcceptInvitation from "@/features/foundations/auth/components/forms/AcceptInvitation";
import ActivateAccount from "@/features/foundations/auth/components/forms/ActivateAccount";
import ForgotPassword from "@/features/foundations/auth/components/forms/ForgotPassword";
import Login from "@/features/foundations/auth/components/forms/Login";
import Register from "@/features/foundations/auth/components/forms/Register";
import ResetPassword from "@/features/foundations/auth/components/forms/ResetPassword";
import { AuthComponent } from "@/features/foundations/auth/enums/AuthComponent";
import { createContext, ReactElement, useContext, useMemo, useState } from "react";

interface AuthContextType {
  activeComponent: ReactElement<any> | null;
  setComponentType: (componentType: AuthComponent) => void;
  setParams: (params?: { code?: string }) => void;
  params?: { code?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({
  children,
  initialComponentType,
  initialParams,
}: {
  children: React.ReactNode;
  initialComponentType?: AuthComponent;
  initialParams?: { code?: string };
}) => {
  const [componentType, setComponentType] = useState<AuthComponent | undefined>(initialComponentType);
  const [params, setParams] = useState<{ code?: string } | undefined>(initialParams);

  const activeComponent = useMemo(() => {
    if (componentType === undefined) return null;

    switch (componentType) {
      case AuthComponent.Login:
        return <Login />;
      case AuthComponent.Register:
        return <Register />;
      case AuthComponent.ForgotPassword:
        return <ForgotPassword />;
      case AuthComponent.ActivateAccount:
        return <ActivateAccount />;
      case AuthComponent.ResetPassword:
        return <ResetPassword />;
      case AuthComponent.AcceptInvitation:
        return <AcceptInvitation />;
      default:
        return <LandingComponent />;
    }
  }, [componentType]);

  return (
    <AuthContext.Provider
      value={{
        activeComponent,
        setComponentType,
        setParams,
        params,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within a AuthComponentProvider");
  }
  return context;
};
