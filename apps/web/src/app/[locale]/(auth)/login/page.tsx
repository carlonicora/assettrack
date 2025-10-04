import AuthContainer from "@/features/foundations/auth/components/containers/AuthContainer";
import { AuthComponent } from "@/features/foundations/auth/enums/AuthComponent";

export default async function LoginPage() {
  return <AuthContainer componentType={AuthComponent.Login} />;
}
