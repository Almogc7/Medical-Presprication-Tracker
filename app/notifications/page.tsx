import { format } from "date-fns";

import { ProtectedPage } from "@/components/layout/protected-page";
import { NotificationList } from "@/components/notifications/notification-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const [{ t }, notifications] = await Promise.all([
    getDictionary(),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <ProtectedPage>
      <PageHeader title={t.notifications.title} />
      {notifications.length ? (
        <NotificationList
          items={notifications.map((notification) => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            isRead: notification.isRead,
            createdAt: format(notification.createdAt, "yyyy-MM-dd HH:mm"),
            severity: notification.severity,
          }))}
        />
      ) : (
        <EmptyState title={t.notifications.title} message={t.notifications.noNotifications} />
      )}
    </ProtectedPage>
  );
}
