"use client";

import { AuthInterface } from "@/features/foundations/auth/data/AuthInterface";
import { AuthService } from "@/features/foundations/auth/data/AuthService";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { useRouter } from "@/i18n/routing";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";
import { useEffect, useState } from "react";

export default function Cookies({
  dehydratedAuth,
  page,
}: {
  dehydratedAuth: JsonApiHydratedDataInterface;
  page?: string;
}) {
  const { setUser } = useCurrentUserContext();
  const router = useRouter();
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (hasSaved) return;
    async function saveTokenOnServer() {
      await AuthService.saveToken({ dehydratedAuth });
      const auth: AuthInterface = rehydrate(Modules.Auth, dehydratedAuth) as AuthInterface;
      setUser(auth.user);
      setHasSaved(true);

      if (page) {
        if (page.startsWith("/")) router.push(page ?? "/");
        window.location.href = page;
      }
    }
    saveTokenOnServer();
  }, [dehydratedAuth, setUser, hasSaved, router]);

  return null;
}
