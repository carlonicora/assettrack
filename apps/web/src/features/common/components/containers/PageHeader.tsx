"use client";

import { PageContentSectionTitle } from "@/features/common/components/containers/PageContentContainer";
import InPage from "@/features/common/components/navigations/InPage";
import { ReactNode } from "react";

type PageHeaderProps = {
  children: ReactNode;
  inPageLinks?: (string | PageContentSectionTitle)[];
};

export default function PageHeader({ children, inPageLinks }: PageHeaderProps) {
  const hasLinks = inPageLinks?.some((link: string | PageContentSectionTitle) =>
    typeof link === "string" ? link : link.title,
  );
  return (
    <div className="flex w-full gap-4">
      {children}
      {inPageLinks && hasLinks && <InPage links={inPageLinks} />}
    </div>
  );
}
