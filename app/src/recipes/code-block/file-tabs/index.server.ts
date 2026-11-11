import { highlight } from "@ariakit/ui/utils/highlight.server";
import { getFileIcon } from "../file-icons.ts";

const component = `import "./toggle.css";
import { useToggle } from "./use-toggle.ts";

export function Toggle({ children }) {
  const { open, toggle } = useToggle();
  return (
    <div className="toggle">
      <button aria-expanded={open} onClick={toggle}>
        {open ? "Hide details" : "Show details"}
      </button>
      {open && <div className="toggle-content">{children}</div>}
    </div>
  );
}`;

const hook = `import { useCallback, useState } from "react";

export function useToggle(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const toggle = useCallback(() => setOpen((open) => !open), []);
  return { open, toggle };
}`;

const style = `.toggle {
  display: grid;
  gap: 0.5rem;
}

.toggle button {
  justify-self: start;
  padding: 0.5rem 0.875rem;
  border: 1px solid oklch(0.8 0.02 255);
  border-radius: 0.5rem;
  font: inherit;
}

.toggle-content {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: oklch(0.97 0.01 255);
}`;

export function load() {
  return {
    files: [
      { name: "toggle.tsx", ...highlight(component, "tsx") },
      { name: "use-toggle.ts", ...highlight(hook, "ts") },
      { name: "toggle.css", ...highlight(style, "css") },
    ].map((file) => ({ ...file, icon: getFileIcon(file.name) })),
  };
}
