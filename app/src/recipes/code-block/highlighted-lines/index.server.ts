import { highlight } from "@ariakit/ui/utils/highlight.server";

const source = `import { useState } from "react";

export function Disclosure({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button aria-expanded={open} onClick={() => setOpen(!open)}>
        {title}
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}`;

export function load() {
  return {
    code: highlight(source, "tsx", {
      // Line 4 is marked. A string marks each occurrence of its text, such as
      // both section tags. The tuple marks only the second and the fourth
      // "open". The arrow function is one mark that spans several tokens.
      lines: [4],
      words: ["section", ["open", 1, 3], "() => setOpen(!open)"],
    }),
  };
}
