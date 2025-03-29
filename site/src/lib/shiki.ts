// @ts-nocheck Revisit this after we merge the site folder into root
import type { BundledLanguage, CodeToTokensOptions } from "shiki";
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
  engine: createOnigurumaEngine(
    // @ts-expect-error
    import("shiki/onig.wasm"),
  ),
});

export function getLangFromFilename(filename: string) {
  const extension = filename.split(".").pop();
  return extension as BundledLanguage;
}
