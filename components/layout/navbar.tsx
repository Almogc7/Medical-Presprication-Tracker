"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useLocale } from "@/components/ui/locale-provider";

export function Navbar({
  unreadNotifications,
  notificationPreview,
  userEmail,
}: {
  unreadNotifications: number;
  notificationPreview: { id: string; title: string; message: string }[];
  userEmail: string;
}) {
  const { t } = useLocale();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
      <div>
        <p className="text-sm text-slate-500">{t.appName}</p>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <NotificationBell unread={unreadNotifications} items={notificationPreview} />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {t.navbar.hello}, {userEmail}
        </div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
            {t.navbar.logout}
          </button>
        </form>
      </div>
    </header>
  );
}
