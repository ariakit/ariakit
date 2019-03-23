import * as React from "react";
import { unstable_MenuStateReturn } from "../MenuState";

export function useShortcuts(
  { stops, move }: Pick<unstable_MenuStateReturn, "stops" | "move">,
  timeout = 500
) {
  const [keys, setKeys] = React.useState("");

  React.useEffect(() => {
    if (!keys) return undefined;

    const timeoutId = setTimeout(() => setKeys(""), timeout);

    const stop = stops.find(s =>
      Boolean(
        s.ref.current &&
          s.ref.current.textContent &&
          s.ref.current.textContent.toLowerCase().startsWith(keys)
      )
    );

    if (stop) {
      move(stop.id);
    }

    return () => clearTimeout(timeoutId);
  }, [keys, stops, move]);

  return (event: React.KeyboardEvent) => {
    if (event.metaKey || event.altKey || event.shiftKey || event.ctrlKey) {
      return;
    }
    if (/^[a-z0-9_-]$/i.test(event.key)) {
      event.preventDefault();
      setKeys(`${keys}${event.key}`);
    }
  };
}
