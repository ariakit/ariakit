import { highlight } from "@ariakit/ui/utils/highlight.server";
import type { HighlightLanguage } from "@ariakit/ui/utils/highlight.server";
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

// The build highlights these files and writes each result to a JSON file. The
// page sends only their names, URLs, and line counts.
export const lazyFiles = {
  "use-toggle.ts": {
    lang: "ts",
    code: `import { useCallback, useState } from "react";

export function useToggle(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const toggle = useCallback(() => setOpen((open) => !open), []);
  return { open, toggle };
}`,
  },
  "toggle.css": {
    lang: "css",
    code: `.toggle {
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
}`,
  },
} satisfies Record<string, { lang: HighlightLanguage; code: string }>;

interface LoadContext {
  /** Returns the URL of the JSON file of a file in lazyFiles. */
  getFileUrl: (name: string) => string;
}

export function load({ getFileUrl }: LoadContext) {
  return {
    first: {
      name: "toggle.tsx",
      icon: getFileIcon("toggle.tsx"),
      ...highlight(component, "tsx"),
    },
    lazy: Object.entries(lazyFiles).map(([name, file]) => ({
      name,
      icon: getFileIcon(name),
      url: getFileUrl(name),
      lines: file.code.split("\n").length,
    })),
  };
}
