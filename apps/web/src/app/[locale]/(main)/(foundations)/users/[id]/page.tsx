import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import { CompanyProvider } from "@/features/foundations/company/contexts/CompanyContext";
import UserContainer from "@/features/foundations/user/components/containers/UserContainer";
import { UserProvider } from "@/features/foundations/user/contexts/UserContext";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { UserService } from "@/features/foundations/user/data/UserService";
import { generateSpecificMetadata } from "@/lib/metadata";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

const getCachedUser = cache(async (id: string) => UserService.findById({ userId: id }));

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations();

  let title = `${t(`types.users`, { count: 1 })}`;

  const user: UserInterface = await getCachedUser(params.id);

  if (await ServerSession.hasPermissionToModule({ module: Modules.User, action: Action.Read, data: user }))
    title = `[${t(`types.users`, { count: 1 })}] ${user.name}`;

  return await generateSpecificMetadata({ title: title });
}

export default async function UserPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = await props.params;

  const user: UserInterface = await getCachedUser(params.id);

  return (
    <CompanyProvider dehydratedCompany={user.company?.dehydrate()}>
      <UserProvider dehydratedUser={user.dehydrate()}>
        <PageContainer>
          <UserContainer />
        </PageContainer>
      </UserProvider>
    </CompanyProvider>
  );
}
