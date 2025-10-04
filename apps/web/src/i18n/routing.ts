import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it", "en"],
  defaultLocale: "it",
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
