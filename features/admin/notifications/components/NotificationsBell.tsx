"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  CalendarClockIcon,
  PlaneTakeoffIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { useNotifications } from "../hooks/queries";
import {
  DEFAULT_KEY,
  useNotificationsReadStore,
} from "../store/notifications-read.store";
import type { NotificationType } from "../types/notification.dto";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  leave: PlaneTakeoffIcon,
  review: StarIcon,
  booking: CalendarClockIcon,
};

export function NotificationsBell({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useNotifications();
  const items = data ?? [];

  const workspaceKey =
    useActiveWorkspaceStore((s) => s.activeId) ?? DEFAULT_KEY;
  const readIds = useNotificationsReadStore(
    (s) => s.readByWorkspace[workspaceKey],
  );
  const markRead = useNotificationsReadStore((s) => s.markRead);
  const markAllRead = useNotificationsReadStore((s) => s.markAllRead);

  const readSet = new Set(readIds ?? []);
  const unread = items.filter((n) => !readSet.has(n.id)).length;

  const handleOpen = (id: string, href: string) => {
    markRead(workspaceKey, id);
    setOpen(false);
    router.push(href);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
          className={cn(
            "relative flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent",
            className,
          )}
        >
          <BellIcon className="size-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() =>
                markAllRead(
                  workspaceKey,
                  items.map((n) => n.id),
                )
              }
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : isError ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Couldn&apos;t load notifications.
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const Icon = TYPE_ICON[n.type];
                const isUnread = !readSet.has(n.id);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleOpen(n.id, n.href)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                        isUnread && "bg-accent/40",
                      )}
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {n.title}
                          </span>
                          {isUnread && (
                            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {n.message}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                          {relativeTime(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Compact "2 hours ago" / "in 3 hours" label for an ISO timestamp. */
function relativeTime(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86_400), "day");
}
