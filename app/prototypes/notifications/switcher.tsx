// PROTOTYPE — throwaway. Floating variant switcher, dev-only.
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const VARIANTS = [
  { key: "A", name: "Popover bell + flat section" },
  { key: "B", name: "Bell jumps to split-pane inbox" },
  { key: "C", name: "Bell drawer + day timeline" },
] as const;

export type VariantKey = (typeof VARIANTS)[number]["key"];

function isEditable(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.matches("input, textarea, [contenteditable]");
}

export function PrototypeSwitcher({ current }: { current: VariantKey }) {
  const navigate = useNavigate();
  const index = VARIANTS.findIndex((v) => v.key === current);

  function go(delta: number) {
    const next = VARIANTS[(index + delta + VARIANTS.length) % VARIANTS.length];
    navigate(`?variant=${next.key}`, { replace: true });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isEditable(e.target)) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!import.meta.env.DEV) return null;

  const v = VARIANTS[index];
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-amber-400 bg-zinc-900 px-2 py-1.5 text-sm text-white shadow-2xl">
      <button
        type="button"
        aria-label="Previous variant"
        onClick={() => go(-1)}
        className="rounded-full p-1.5 hover:bg-zinc-700"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="min-w-56 text-center font-medium">
        {v.key} ({v.name})
      </span>
      <button
        type="button"
        aria-label="Next variant"
        onClick={() => go(1)}
        className="rounded-full p-1.5 hover:bg-zinc-700"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
