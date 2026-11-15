// PROTOTYPE — throwaway. Variant A: popover bell (recent 4) + flat chronological section.
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { KIND_LABEL, STUB_NOTIFICATIONS } from "./data";

export function VariantA() {
  const [items, setItems] = useState(STUB_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => n.unread).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }
  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div>
      <header className="flex h-14 items-center justify-end border-b px-6">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="relative rounded-md p-2 hover:bg-muted"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                {unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border bg-background shadow-xl">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-sm font-semibold">Recent</span>
                <Button size="sm" variant="ghost" onClick={markAllRead}>
                  Mark all read
                </Button>
              </div>
              <ul>
                {items.slice(0, 4).map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="flex w-full gap-2 px-3 py-2 text-left hover:bg-muted"
                    >
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          n.unread ? "bg-blue-600" : "bg-transparent"
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{n.title}</span>
                        <span className="block text-xs text-muted-foreground">{n.ago} ago</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <a href="#all-notifications" onClick={() => setOpen(false)} className="block border-t px-3 py-2 text-center text-sm text-blue-700 hover:bg-muted">
                See all notifications
              </a>
            </div>
          )}
        </div>
      </header>

      <section id="all-notifications" className="mx-auto max-w-2xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <span className="text-sm text-muted-foreground">Last 90 days · {unread} unread</span>
        </div>
        <ul className="divide-y rounded-lg border">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted",
                  n.unread && "bg-blue-50 dark:bg-blue-950/30"
                )}
              >
                <span
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.unread ? "bg-blue-600" : "bg-transparent")}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{n.title}</span>
                  <span className="block text-sm text-muted-foreground">{n.body}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {KIND_LABEL[n.kind]} · {n.ago}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
