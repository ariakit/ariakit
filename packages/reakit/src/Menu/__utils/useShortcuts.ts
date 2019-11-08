import * as React from "react";
import { closest } from "reakit-utils/closest";
import { MenuStateReturn } from "../MenuState";

export function useShortcuts(
  menuRef: React.RefObject<HTMLElement>,
  { stops, move }: Pick<MenuStateReturn, "stops" | "move">,
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
  }, [keys, stops, move, timeout]);

  React.useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.altKey || event.shiftKey || event.ctrlKey) {
        return;
      }
      const target = event.target as HTMLElement;
      const role = target.getAttribute("role");
      const targetIsMenu = target === menu;
      const targetIsMenuItem =
        role &&
        role.indexOf("menuitem") >= 0 &&
        closest(target, "[role=menu],[role=menubar]") === menu;

      if (!targetIsMenu && !targetIsMenuItem) return;

      if (/^[a-z0-9_-]$/i.test(event.key)) {
        event.stopPropagation();
        event.preventDefault();
        setKeys(k => `${k}${event.key}`);
      }
    };

    // https://github.com/facebook/react/issues/11387#issuecomment-524113945
    menu.addEventListener("keydown", onKeyDown);
    return () => menu.removeEventListener("keydown", onKeyDown);
  }, [menuRef, setKeys]);
}
