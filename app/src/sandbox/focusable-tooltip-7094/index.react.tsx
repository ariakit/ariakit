import * as Ariakit from "@ariakit/react";
import { useEffect } from "react";

// TODO: Remove once https://github.com/ariakit/ariakit/issues/7094 is released.
// Safari navigates with Option+Tab when the macOS keyboard navigation setting
// is off, but Ariakit ignores every Alt-modified key when it records keyboard
// modality. Re-announcing the gesture without the modifier makes it count.
function useOptionTabKeyboardModality() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.isTrusted) return;
      if (!event.altKey) return;
      if (event.key !== "Tab") return;
      // Ariakit reads only the modifier keys here, so the re-announced event
      // carries no key. Naming it Tab would make other document listeners
      // handle one gesture twice, which can move focus twice in a focus trap.
      document.dispatchEvent(new KeyboardEvent("keydown"));
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);
}

export default function Example() {
  useOptionTabKeyboardModality();
  return (
    <div>
      <p>Click here, then press Option+Tab to focus the button.</p>
      <Ariakit.TooltipProvider>
        <Ariakit.TooltipAnchor render={<Ariakit.Button />}>
          Bookmark
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Add to bookmarks</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
    </div>
  );
}
