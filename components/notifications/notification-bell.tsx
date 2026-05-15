"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useLocale } from "@/components/ui/locale-provider";

export function NotificationBell({
  unread,
  items,
}: {
  unread: number;
  items: { id: string; title: string; message: string }[];
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownId = "notification-dropdown";

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={dropdownId}
        aria-haspopup="true"
        aria-label={unread > 0 ? `${t.navbar.notifications} (${unread} unread)` : t.navbar.notifications}
        className="relative whitespace-nowrap rounded-[var(--radius-component)] border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:bg-border-subtle"
      >
        {t.navbar.notifications}
        {unread > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-status-danger px-1 text-center text-xs font-semibold text-accent-fg"
          >
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={dropdownId}
          role="region"
          aria-label={t.notifications.title}
          aria-live="polite"
          className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-[var(--radius-panel)] border border-border bg-surface p-3 shadow-lg"
        >
          <h3 className="mb-2 text-sm font-semibold text-foreground">{t.notifications.title}</h3>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {items.length ? (
              items.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-component)] border border-border-subtle bg-canvas p-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-foreground-muted">{item.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-foreground-subtle">{t.notifications.noNotifications}</p>
            )}
          </div>
          <Link
            className="mt-3 inline-block text-xs font-semibold text-accent underline"
            href="/notifications"
            onClick={() => setOpen(false)}
          >
            {t.sidebar.notifications}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
