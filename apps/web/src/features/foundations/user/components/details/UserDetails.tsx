"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AttributeElement from "@/features/common/components/lists/AttributeElement";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { useUserContext } from "@/features/foundations/user/contexts/UserContext";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { Link } from "@/components/custom-ui/link";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ReactElement } from "react";

type UserDetailsProps = {
  small?: boolean;
};

export default function UserDetails({ small }: UserDetailsProps) {
  const { user } = useUserContext();
  if (!user) return null;

  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();

  let roles: ReactElement<any> = <></>;

  if (user.roles && user.roles.length > 0) {
    roles = (
      <div className="w-full">
        <div className="flex flex-wrap gap-2">
          {user.roles.map((role: RoleInterface, index: number) => (
            <Link key={role.id} href={generateUrl({ page: Modules.Role, id: role.id })}>
              <Badge className="mr-2" variant={`default`}>
                {t(`foundations.role.roles`, { role: role.id.replaceAll(`-`, ``) })}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const contentResponse = (
    <div className="flex w-full flex-row items-start justify-between gap-x-4">
      <div className="flex w-full flex-col gap-y-0">
        {small && <h2 className="text-2xl font-semibold">{user.name}</h2>}
        <AttributeElement inline={true} title={t(`foundations.user.fields.title.label`)} value={user.title} />
        <AttributeElement inline={true} title={t(`foundations.user.fields.email.label`)} value={user.email} />
        {user.phone && (
          <AttributeElement inline={true} title={t(`foundations.user.fields.phone.label`)} value={user.phone} />
        )}
        <AttributeElement inline={false} title={t(`foundations.user.fields.bio.label`)} value={user.bio} />
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-row items-start gap-x-4">
      {user.avatar && (
        <div className="flex flex-col">
          <Card className={`${small ? `w-60` : `w-96`} flex-shrink-0 self-start`}>
            <CardHeader className="p-0">
              <div className="relative aspect-square w-full">
                <Image src={user.avatar} alt={user.name} fill className="rounded-lg object-cover" />
              </div>
            </CardHeader>
          </Card>
          {small && <>{roles && <AttributeElement inline={false} value={roles} />}</>}
        </div>
      )}
      {small ? (
        contentResponse
      ) : (
        <Card className="flex-1">
          <CardContent className="p-4">{contentResponse}</CardContent>
        </Card>
      )}
    </div>
  );
}
