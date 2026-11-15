// PROTOTYPE — throwaway. Variant C: bell opens a right-side drawer (Unread / All tabs);
// section is a day-grouped timeline with checkboxes for bulk mark-read.
import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { DAY_ORDER, KIND_LABEL, STUB_NOTIFICATIONS } from "./data";

export function VariantC() {
  const [items, setItems] = useState(STUB_NOTIFICATIONS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState<"unread" | "all">("unread");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const unread = items.filter((n) => n.unread).length;

  function markRead(ids: string[]) {
    const set = new Set(ids);
    setItems((prev) => prev.map((n) => (set.has(n.id) ? { ...n, unread: false } : n)));
    setPicked(new Set());
  }
  function togglePick(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const drawerItems = tab === "unread" ? items.filter((n) => n.unread) : items;

  return (
    <div>
      <header className="flex h-14 items-center justify-end border-b px-6">
        <button
          type="button"
          aria-label="Open notifications"
          onClick={() => setDrawerOpen(true)}
          className="relative rounded-md p-2 hover:bg-muted"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-0 top-0 size-2.5 rounded-full bg-red-600 ring-2 ring-background" />
          )}
        </button>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setDrawerOpen(false)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-96 max-w-full flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex gap-1">
                {(["unread", "all"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-md px-3 py-1 text-sm capitalize",
                      tab === t ? "bg-muted font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
            <ul className="flex-1 divide-y overflow-y-auto">
              {drawerItems.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead([n.id])}
                    className="flex w-full gap-3 px-4 py-3 text-left hover:bg-muted"
                  >
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.unread ? "bg-blue-600" : "bg-transparent")} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{n.title}</span>
                      <span className="block text-xs text-muted-foreground">{n.ago} ago</span>
                    </span>
                  </button>
                </li>
              ))}
              {drawerItems.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">You're all caught up.</li>
              )}
            </ul>
            <div className="border-t p-3">
              <Button size="sm" variant="ghost" className="w-full" onClick={() => setDrawerOpen(false)}>
                Open full timeline
              </Button>
            </div>
          </aside>
        </div>
      )}

      <section className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <Button size="sm" disabled={picked.size === 0} onClick={() => markRead([...picked])}>
            Mark {picked.size || ""} selected read
          </Button>
        </div>
        {DAY_ORDER.map((day) => {
          const group = items.filter((n) => n.day === day);
          if (group.length === 0) return null;
          return (
            <div key={day} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</h3>
              <ul className="space-y-1">
                {group.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-muted">
                    <input
                      type="checkbox"
                      aria-label={`Select ${n.title}`}
                      checked={picked.has(n.id)}
                      onChange={() => togglePick(n.id)}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm", n.unread ? "font-semibold" : "font-medium text-muted-foreground")}>
                        {n.title}
                      </span>
                      <span className="block text-sm text-muted-foreground">{n.body}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {KIND_LABEL[n.kind]} · {n.ago}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
