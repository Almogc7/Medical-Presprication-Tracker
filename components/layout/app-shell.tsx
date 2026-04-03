import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { LocaleProvider } from "@/components/ui/locale-provider";
import type { LocaleContextValue } from "@/types/i18n";

export function AppShell({
  localeContext,
  unreadNotifications,
  notificationPreview,
  userEmail,
  children,
}: {
  localeContext: LocaleContextValue;
  unreadNotifications: number;
  notificationPreview: { id: string; title: string; message: string }[];
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider value={localeContext}>
      <div className="min-h-screen bg-slate-100">
        <div className="md:flex">
          <Sidebar />
          <div className="flex-1">
            <Navbar
              unreadNotifications={unreadNotifications}
              notificationPreview={notificationPreview}
              userEmail={userEmail}
            />
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </div>
      </div>
    </LocaleProvider>
  );
}
