import PageContainer from "@/features/common/components/containers/PageContainer";
import NotificationsListContainer from "@/features/foundations/notification/components/containers/NotificationsListContainer";

export default async function NotificationListPage() {
  return (
    <PageContainer testId="page-inbox-container">
      <NotificationsListContainer />
    </PageContainer>
  );
}
