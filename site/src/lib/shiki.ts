// @ts-nocheck Revisit this after we merge the site folder into root
import type { BundledLanguage } from "shiki";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

export const highlighter = await createHighlighterCore({
  themes: [
    import("@shikijs/themes/dark-plus"),
    import("@shikijs/themes/github-light"),
  ],
  langs: [
    import("@shikijs/langs/javascript"),
    import("@shikijs/langs/css"),
    import("@shikijs/langs/typescript"),
    import("@shikijs/langs/tsx"),
    import("@shikijs/langs/json"),
    import("@shikijs/langs/html"),
    import("@shikijs/langs/bash"),
    import("@shikijs/langs/python"),
    import("@shikijs/langs/jsx"),
  ],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export function getLangFromFilename(filename: string): BundledLanguage {
  if (filename === "npm") return "bash";
  if (filename === "bun") return "bash";
  if (filename === "yarn") return "bash";
  if (filename === "pnpm") return "bash";
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension as BundledLanguage;
}
