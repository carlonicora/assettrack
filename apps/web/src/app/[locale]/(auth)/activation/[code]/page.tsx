import AuthContainer from "@/features/foundations/auth/components/containers/AuthContainer";
import { AuthComponent } from "@/features/foundations/auth/enums/AuthComponent";
import { generateSpecificMetadata } from "@/lib/metadata";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return await generateSpecificMetadata({});
}

export default async function ActivatePage(props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  return <AuthContainer componentType={AuthComponent.ActivateAccount} params={{ code: params.code }} />;
}
