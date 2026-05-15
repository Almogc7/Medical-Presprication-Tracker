"use client";

import { cn } from "@/utils/cn";

export function FilterTabs({
  items,
  value,
  onChange,
}: {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <div
        role="tablist"
        aria-label="Filter prescriptions"
        className="inline-flex min-w-max rounded-xl border border-border bg-surface p-1 shadow-sm"
      >
        {items.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-fg"
                  : "text-slate-600 hover:bg-border-subtle",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
