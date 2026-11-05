import { highlight } from "@ariakit/ui/utils/highlight.server";
import type { LazyFile, PreviewLoadContext } from "#app/lib/code-files.ts";

const counter = `export function increment(count: number) {
  return count + 1;
}`;

// The build highlights this file and writes the result to a JSON file, which
// the example loads on demand.
export const lazyFiles = {
  "counter.css": {
    lang: "css",
    code: `.counter {
  display: flex;
  gap: 0.5rem;
}`,
  },
} satisfies Record<string, LazyFile>;

export function load({ getFileUrl }: PreviewLoadContext) {
  return {
    file: { name: "counter.ts", ...highlight(counter, "ts") },
    lazyFile: { name: "counter.css", url: getFileUrl("counter.css") },
  };
}
