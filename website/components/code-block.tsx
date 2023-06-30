import { cx } from "@ariakit/core/utils/misc";
import { BUNDLED_LANGUAGES, FontStyle, getHighlighter } from "shiki";
import type { Highlighter, IShikiTheme, IThemedToken } from "shiki";
import css from "shiki/languages/css.tmLanguage.json";
import diff from "shiki/languages/diff.tmLanguage.json";
import html from "shiki/languages/html.tmLanguage.json";
import javascript from "shiki/languages/javascript.tmLanguage.json";
import jsx from "shiki/languages/jsx.tmLanguage.json";
import sh from "shiki/languages/shellscript.tmLanguage.json";
import tsx from "shiki/languages/tsx.tmLanguage.json";
import typescript from "shiki/languages/typescript.tmLanguage.json";
import darkPlus from "shiki/themes/dark-plus.json";
import { twJoin, twMerge } from "tailwind-merge";
import { tw } from "utils/tw.js";
import type { IGrammar } from "vscode-textmate";
import { CopyToClipboard } from "./copy-to-clipboard.js";

interface Props {
  code: string;
  lang?: string;
  filename?: string;
  lineNumbers?: boolean;
  highlightLines?: number[];
  highlightTokens?: (string | readonly [string, number[]])[];
  type?: "static" | "editor" | "definition";
  definition?: boolean;
  className?: string;
  preClassName?: string;
}

const style = {
  highlightBefore: tw`
    relative before:absolute before:left-0 before:top-0
    before:h-full before:w-1 before:bg-blue-600
  `,
};

function getExtension(filename?: string) {
  const extension = filename?.split(".").pop();
  if (!extension) return;
  return extension.toLowerCase();
}

function parseFontStyle(fontStyle?: FontStyle) {
  if (!fontStyle) return;
  return cx(
    fontStyle & FontStyle.Italic && "italic",
    fontStyle & FontStyle.Bold && "font-bold",
    fontStyle & FontStyle.Underline && "underline"
  );
}

function getLanguage(lang: string, grammar: any) {
  const language = BUNDLED_LANGUAGES.find((l) => l.id === lang);
  if (!language) throw new Error(`Language not found: ${lang}`);
  return { ...language, grammar: grammar as IGrammar };
}

function loadLanguages(highlighter: Highlighter) {
  return Promise.all([
    highlighter.loadLanguage(getLanguage("javascript", javascript)),
    highlighter.loadLanguage(getLanguage("typescript", typescript)),
    highlighter.loadLanguage(getLanguage("tsx", tsx)),
    highlighter.loadLanguage(getLanguage("jsx", jsx)),
    highlighter.loadLanguage(getLanguage("shellscript", sh)),
    highlighter.loadLanguage(getLanguage("css", css)),
    highlighter.loadLanguage(getLanguage("html", html)),
    highlighter.loadLanguage(getLanguage("diff", diff)),
  ]);
}

let highlighter: Highlighter | undefined;

export async function CodeBlock({
  code,
  filename,
  lang = getExtension(filename),
  type = "static",
  lineNumbers = type === "editor",
  highlightLines,
  highlightTokens,
  className,
}: Props) {
  code = type === "static" || type === "definition" ? code.trim() : code;

  let tokens: IThemedToken[][] = [];

  if (!highlighter) {
    try {
      highlighter = await getHighlighter({
        theme: darkPlus as unknown as IShikiTheme,
        langs: [],
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  try {
    await loadLanguages(highlighter);
    tokens = highlighter.codeToThemedTokens(code, lang, undefined, {
      includeExplanation: false,
    });
  } catch (error) {
    console.error(error);
  }

  const oneLiner = tokens.length === 1;
  const tokensSeen: Record<string, number> = {};

  return (
    <div
      className={twMerge(
        type !== "definition" && "w-full",
        "relative max-h-[inherit]",
        className
      )}
    >
      {type === "static" && (
        <CopyToClipboard
          text={code}
          className={twJoin(`
          absolute right-2 top-2 z-[11] h-[37px] rounded-md bg-transparent px-3
          text-sm text-white/75 hover:bg-white/[15%] hover:text-white
          focus-visible:ariakit-outline-input dark:hover:!bg-white/5`)}
        />
      )}
      <pre
        className={twJoin(
          type === "definition" ? "w-max max-w-full py-3" : "w-full pt-4",
          type === "definition" && "rounded-lg bg-gray-850",
          type === "static" && !oneLiner && "sm:pt-8",
          type === "static" && "rounded-lg bg-gray-850 sm:rounded-xl",
          type === "editor" && "rounded-b-lg bg-[#1e1e1e] sm:rounded-b-xl",
          !oneLiner && (highlightLines?.length || highlightTokens?.length)
            ? "leading-[26px]"
            : "leading-[21px]",
          "relative z-10 flex max-h-[inherit] overflow-auto text-sm text-white [color-scheme:dark]"
        )}
      >
        {lineNumbers && (
          <div
            aria-hidden
            className={twJoin(
              type === "static" && "flex",
              type === "editor" && "hidden sm:flex",
              "sticky left-0 h-full select-none flex-col bg-inherit text-right text-[#858585]"
            )}
          >
            {tokens.map((_, i) => {
              const highlighted = highlightLines?.includes(i + 1);
              return (
                <span
                  key={i}
                  className={cx(
                    type === "static" && "px-4 sm:pl-8 sm:pr-6",
                    type === "editor" && "min-w-[68px] pl-0 pr-[26px]",
                    highlighted && "bg-blue-600/[15%] text-[#c6c6c6]",
                    highlighted && style.highlightBefore
                  )}
                >
                  {i + 1}
                </span>
              );
            })}
          </div>
        )}
        <code
          className={twJoin(type !== "definition" && "w-full", "grid h-max")}
        >
          {tokens.map((line, i) => {
            const highlighted = highlightLines?.includes(i + 1);
            return (
              <div
                key={i}
                className={twJoin(
                  type === "static" && "sm:!px-8",
                  type === "static" && lineNumbers && "!pl-0 sm:!pl-0",
                  type === "editor" && lineNumbers && "sm:!pl-0",
                  type !== "definition" && "px-4 pr-14 sm:pl-[26px]",
                  type === "definition" && "px-4",
                  highlighted && "bg-blue-600/20 dark:bg-blue-600/[15%]",
                  highlighted && !lineNumbers && style.highlightBefore
                )}
              >
                {line.length ? (
                  <>
                    {line.map((token, j) => {
                      const highlighted = highlightTokens?.some((t) => {
                        const [word, indexes] = Array.isArray(t) ? t : [t];
                        if (token.content !== word) return false;
                        if (!indexes) return token.content === word;
                        if (tokensSeen[word] === undefined) {
                          tokensSeen[word] = 0;
                        }
                        const index = tokensSeen[word]++;
                        return indexes.includes(index);
                      });
                      return (
                        <span
                          key={j}
                          style={{ color: token.color }}
                          className={cx(
                            parseFontStyle(token.fontStyle),
                            highlighted &&
                              "-mx-[3px] rounded bg-white/10 px-[3px] py-1"
                          )}
                        >
                          {token.content}
                        </span>
                      );
                    })}
                    {"\n"}
                  </>
                ) : (
                  "\n"
                )}
              </div>
            );
          })}
          <div
            className={twJoin(
              type === "static" && !oneLiner && "sm:h-8",
              type !== "definition" && "h-4"
            )}
          />
        </code>
      </pre>
    </div>
  );
}
