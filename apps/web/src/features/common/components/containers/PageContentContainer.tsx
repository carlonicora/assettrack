"use client";

import PageHeader from "@/features/common/components/containers/PageHeader";
import TabsContainer, { Tab } from "@/features/common/components/containers/TabsContainer";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { Action, ModuleWithPermissions } from "@/permisions/types";
import { ReactNode } from "react";

export type PageContentSectionTitle = {
  title: string;
  options: React.ReactNode[];
};

export type PageContentSectionData = {
  title: string | PageContentSectionTitle;
  content: React.ReactNode | null;
  modules?: ModuleWithPermissions[];
  action?: Action;
  feature?: string;
};

export type PageContentData = {
  details: ReactNode;
  sections: PageContentSectionData[];
};

type PageContentContainerProps = {
  data: PageContentData;
};

export default function PageContentContainer({ data }: PageContentContainerProps) {
  const { hasPermissionToModules, hasAccesToFeature } = useCurrentUserContext();

  const sectionTabs: Tab[] = data.sections
    .filter((section: PageContentSectionData) => section.content)
    .filter((section: PageContentSectionData) =>
      section.modules && section.action
        ? hasPermissionToModules({ modules: section.modules, action: section.action })
        : true,
    )
    .filter((section: PageContentSectionData) => (section.feature ? hasAccesToFeature(section.feature) : true))
    .map((section: PageContentSectionData) => {
      const title = typeof section.title === "string" ? section.title : section.title.title;

      return {
        label: title,
        content: section.content,
      };
    });

  return (
    <div className="flex flex-col gap-4">
      {<PageHeader>{data.details}</PageHeader>}
      <TabsContainer tabs={sectionTabs} style="navigation" />
    </div>
  );
}
