import Cookies from "@/features/foundations/auth/components/forms/Cookies";
import { AuthInterface } from "@/features/foundations/auth/data/AuthInterface";
import { AuthService } from "@/features/foundations/auth/data/AuthService";

export default async function AuthPage(props: { searchParams: Promise<{ code: string }> }) {
  const searchParams = await props.searchParams;
  const auth: AuthInterface = await AuthService.findToken({
    tokenCode: searchParams.code,
  });

  return <Cookies dehydratedAuth={auth.dehydrate()} />;
}
