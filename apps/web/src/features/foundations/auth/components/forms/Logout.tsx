"use client";

import { AuthService } from "@/features/foundations/auth/data/AuthService";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { useEffect } from "react";

export default function Logout() {
  const generateUrl = usePageUrlGenerator();

  useEffect(() => {
    const logOut = async () => {
      await AuthService.logout();
      window.location.href = generateUrl({ page: `/` });
    };
    logOut();
  }, []);

  return <></>;
}
