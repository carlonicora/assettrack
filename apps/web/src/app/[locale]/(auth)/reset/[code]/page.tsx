import AuthContainer from "@/features/foundations/auth/components/containers/AuthContainer";
import { AuthComponent } from "@/features/foundations/auth/enums/AuthComponent";

export default async function ResetPage(props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  return <AuthContainer componentType={AuthComponent.ResetPassword} params={{ code: params.code }} />;
}
