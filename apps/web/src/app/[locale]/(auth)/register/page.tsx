import AuthContainer from "@/features/foundations/auth/components/containers/AuthContainer";
import { AuthComponent } from "@/features/foundations/auth/enums/AuthComponent";

export default async function RegisterPage() {
  return <AuthContainer componentType={AuthComponent.Register} />;
}
