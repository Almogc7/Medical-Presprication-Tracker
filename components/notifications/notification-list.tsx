"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/ui/locale-provider";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  severity: "low" | "medium" | "high" | "critical";
};

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const { t } = useLocale();
  const [state, setState] = useState(items);

  async function markAsRead(id: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setState((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  return (
    <div className="space-y-3">
      {state.map((item) => (
        <div
          key={item.id}
          className={`rounded-[var(--radius-panel)] border p-4 shadow-sm ${
            item.isRead
              ? "border-border bg-surface"
              : "border-status-warning/40 bg-status-warning-bg"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-sm text-foreground-muted">{item.message}</p>
              <p className="mt-2 text-xs text-foreground-subtle">{item.createdAt}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={item.isRead}
              onClick={() => markAsRead(item.id)}
              aria-label={item.isRead ? "Already marked as read" : t.notifications.markAsRead}
              className="w-full sm:w-auto"
            >
              {t.notifications.markAsRead}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
