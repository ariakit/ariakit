import { createHighlighterCore, hastToHtml } from "shiki/core";
import type { HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let highlighter: Promise<HighlighterCore> | undefined;

// The JavaScript regex engine, one grammar, and two themes keep the download
// small. Load more grammars only for the languages that people can type.
function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [
      import("@shikijs/themes/github-light"),
      import("@shikijs/themes/github-dark"),
    ],
    langs: [import("@shikijs/langs/tsx")],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/**
 * Returns the HTML of the lines, like the server helper, for the `html` prop of
 * `CodeBlockCode`.
 */
export async function highlightInBrowser(code: string) {
  const instance = await getHighlighter();
  const root = instance.codeToHast(code, {
    lang: "tsx",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
  const pre = root.children[0];
  if (pre?.type !== "element") return "";
  const codeElement = pre.children[0];
  if (codeElement?.type !== "element") return "";
  return hastToHtml({ type: "root", children: codeElement.children });
}
