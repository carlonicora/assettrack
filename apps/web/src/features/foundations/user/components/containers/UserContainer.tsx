"use client";

import PageContentContainer, { PageContentData } from "@/features/common/components/containers/PageContentContainer";
import UserDetails from "@/features/foundations/user/components/details/UserDetails";
import { useUserContext } from "@/features/foundations/user/contexts/UserContext";
import { useTranslations } from "next-intl";

export default function UserContainer() {
  const { user } = useUserContext();
  if (!user) return null;

  const t = useTranslations();

  const pageContent: PageContentData = {
    details: <UserDetails />,
    sections: [],
  };

  return <PageContentContainer data={pageContent} />;
}
