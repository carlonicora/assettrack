import AuthContainer from "@/features/foundations/auth/components/containers/AuthContainer";
import { AuthComponent } from "@/features/foundations/auth/enums/AuthComponent";

export default async function InvitationPage(props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  return <AuthContainer componentType={AuthComponent.AcceptInvitation} params={{ code: params.code }} />;
}
