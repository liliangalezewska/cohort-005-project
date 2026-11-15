// PROTOTYPE — throwaway. Variant B: bell is a plain count link into a split-pane inbox (filters left, detail right).
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { KIND_LABEL, STUB_NOTIFICATIONS, type NotificationKind } from "./data";

type Filter = "all" | NotificationKind;
const FILTERS: Filter[] = ["all", "question", "reply", "test", "refund", "admin"];

export function VariantB() {
  const [items, setItems] = useState(STUB_NOTIFICATIONS);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string>(STUB_NOTIFICATIONS[0].id);
  const unread = items.filter((n) => n.unread).length;

  const visible = items.filter((n) => filter === "all" || n.kind === filter);
  const selected = items.find((n) => n.id === selectedId) ?? null;

  function select(id: string) {
    setSelectedId(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }
  function toggleUnread(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  }

  return (
    <div>
      <header className="flex h-14 items-center justify-end border-b px-6">
        <a
          href="#inbox"
          aria-label={`Notifications, ${unread} unread`}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm hover:bg-muted"
        >
          <Bell className="size-5" />
          <span className="font-semibold tabular-nums">{unread}</span>
        </a>
      </header>

      <section id="inbox" className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
        <div className="grid gap-4 md:grid-cols-[160px_1fr_1fr]">
          <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
            {FILTERS.map((f) => {
              const count = f === "all" ? items.length : items.filter((n) => n.kind === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-1.5 text-sm",
                    filter === f ? "bg-muted font-semibold" : "hover:bg-muted/60"
                  )}
                >
                  <span>{f === "all" ? "All" : KIND_LABEL[f]}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                </button>
              );
            })}
          </nav>

          <ul className="divide-y rounded-lg border">
            {visible.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => select(n.id)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-muted",
                    selectedId === n.id && "bg-muted"
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {n.unread && <span className="size-1.5 rounded-full bg-blue-600" />}
                    {n.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {KIND_LABEL[n.kind]} · {n.ago}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-lg border p-4">
            {selected ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {KIND_LABEL[selected.kind]} · {selected.day}
                </p>
                <h3 className="font-semibold">{selected.title}</h3>
                <p className="text-sm text-muted-foreground">{selected.body}</p>
                <Button size="sm" variant="outline" onClick={() => toggleUnread(selected.id)}>
                  Mark as {selected.unread ? "read" : "unread"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a notification.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
