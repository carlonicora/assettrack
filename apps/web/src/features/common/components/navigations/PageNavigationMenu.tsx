"use client";

import { Link } from "@/components/custom-ui/link";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { Modules } from "@/modules/modules";
import { Action, ModuleWithPermissions } from "@/permisions/types";
import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Module = {
  title: string;
  description: string;
  link?: string;
  module?: ModuleWithPermissions;
};

type Feature = {
  title?: string;
  featureId?: string;
  modules: Module[];
};

function ListItem({
  index,
  feature,
  setDescription,
}: {
  index: number;
  feature: Feature;
  setDescription: (description: string) => void;
}) {
  const { hasAccesToFeature, hasPermissionToModule } = useCurrentUserContext();
  const generateUrl = usePageUrlGenerator();

  if (feature.featureId && !hasAccesToFeature(feature.featureId)) return null;

  return (
    <>
      {feature.title && (
        <NavigationMenuItem className={`my-2 ${index > 0 ? `pt-8` : ``} pl-2 text-sm font-semibold`}>
          {feature.title}
        </NavigationMenuItem>
      )}
      {feature.modules
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((module: Module) => {
          if (module.module && !hasPermissionToModule({ module: module.module, action: Action.Read })) return null;
          return (
            <NavigationMenuLink
              key={module.title}
              asChild
              onMouseEnter={() => setDescription(module.description)}
              onMouseLeave={() => setDescription("")}
            >
              <Link className="text-xs" href={module.link ?? generateUrl({ page: module.module })}>
                {module.title}
                {/* <div className="text-sm font-medium">{module.title}</div>
              <div className="text-muted-foreground text-xs">{module.description} </div> */}
              </Link>
            </NavigationMenuLink>
          );
        })}
    </>
  );
}

export default function PageNavigationMenu() {
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();
  const { company } = useCurrentUserContext();
  const [description, setDescription] = useState<string>("");

  const features: Feature[][] = [
    [
      {
        modules: [
          {
            title: t(`generic.home`),
            link: generateUrl({ page: `/` }),
            description: "This is a description",
          },
          {
            title: t(`foundations.notification.inbox`),
            link: generateUrl({ page: Modules.Notification }),
            description: "This is a description",
          },
        ],
      },
      {
        title: t(`types.companies`, { count: 1 }),
        modules: [
          {
            title: company?.name ?? "",
            module: Modules.Company,
            description: "This is a description",
          },
          {
            title: t(`types.roles`, { count: 2 }),
            module: Modules.Role,
            description: "This is a description",
          },
          {
            title: t(`types.users`, { count: 2 }),
            module: Modules.User,
            description: "This is a description",
          },
        ],
      },
    ],
  ];
  return (
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>
          <MenuIcon className="h-5 w-5" />
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className={`flex w-[900px] flex-col gap-y-2 p-4 pt-2`}>
            <div className="flex w-full text-2xl font-semibold">{t(`generic.navigation`)}</div>
            <div
              className={`${!!description ? `bg-muted` : ``} text-muted-foreground flex min-h-8 w-full rounded-sm p-2 text-xs`}
            >
              {description}
            </div>
            <div className="flex w-full flex-row items-start justify-between">
              {features.map((featureGroup: Feature[], index: number) => (
                <div key={index} className="w-52">
                  <ul>
                    {featureGroup.map((feature: Feature, index: number) => (
                      <ListItem key={index} index={index} feature={feature} setDescription={setDescription} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  );
}
