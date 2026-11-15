// PROTOTYPE — throwaway. Route for the notifications bell/section UI prototype.
// Sits inside the app layout so it gets the real sidebar. Remove before merging.
import { useSearchParams } from "react-router";
import { VariantA } from "~/prototypes/notifications/variant-a";
import { VariantB } from "~/prototypes/notifications/variant-b";
import { VariantC } from "~/prototypes/notifications/variant-c";
import { PrototypeSwitcher, type VariantKey } from "~/prototypes/notifications/switcher";

export default function PrototypeNotifications() {
  const [params] = useSearchParams();
  const raw = params.get("variant");
  const variant: VariantKey = raw === "B" || raw === "C" ? raw : "A";

  return (
    <>
      {variant === "A" && <VariantA />}
      {variant === "B" && <VariantB />}
      {variant === "C" && <VariantC />}
      <PrototypeSwitcher current={variant} />
    </>
  );
}
