"use client";
import PageContainer from "@/features/common/components/containers/PageContainer";
import ErrorDetails from "@/features/common/components/errors/ErrorDetails";
import { UserProvider } from "@/features/foundations/user/contexts/UserContext";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const customError = JSON.parse(error.message);
  return (
    <UserProvider>
      <PageContainer>
        <ErrorDetails code={customError.code ?? 500} message={customError.message ?? error} />
      </PageContainer>
    </UserProvider>
  );
}
