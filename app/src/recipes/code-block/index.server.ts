import { highlight } from "@ariakit/ui/utils/highlight.server";

const source = `import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`;

// The page calls this function on the server or at build time, and passes the
// result to the example as props. The browser gets the HTML and the text to
// copy, but not Shiki.
export function load() {
  return { code: highlight(source, "tsx") };
}
