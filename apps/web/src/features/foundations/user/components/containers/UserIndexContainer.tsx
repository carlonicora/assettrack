"use client";

import PageContentContainer, { PageContentData } from "@/features/common/components/containers/PageContentContainer";
import UserIndexDetails from "@/features/foundations/user/components/details/UserIndexDetails";
import { useUserContext } from "@/features/foundations/user/contexts/UserContext";

export default function UserIndexContainer() {
  const { user } = useUserContext();
  if (!user) return null;

  const pageContent: PageContentData = {
    details: <UserIndexDetails />,
    sections: [],
  };

  return <PageContentContainer data={pageContent} />;
}
