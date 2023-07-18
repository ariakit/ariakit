import links from "build-pages/links.js";
import { kebabCase } from "lodash-es";
import Link from "next/link.js";
import { FontStyle, getHighlighter } from "shiki";
import type { Highlighter, IThemedToken } from "shiki";
import { twJoin, twMerge } from "tailwind-merge";
import { isValidHref } from "utils/is-valid-href.js";
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

const highlightBeforeStyle = twJoin(
  "relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-600",
);

function getExtension(filename?: string) {
  const extension = filename?.split(".").pop();
  if (!extension) return;
  return extension.toLowerCase();
}

function parseFontStyle(fontStyle?: FontStyle) {
  if (!fontStyle) return;
  return twJoin(
    fontStyle & FontStyle.Italic && "italic",
    fontStyle & FontStyle.Bold && "font-bold",
    fontStyle & FontStyle.Underline && "underline",
  );
}

function getLinkableType(token: IThemedToken, line: IThemedToken[]) {
  if (!token.explanation) return null;

  for (const { scopes } of token.explanation) {
    const s = scopes.map((s) => s.scopeName.replace(/\.[tj]sx?/g, ""));
    if (
      s.includes("variable.other.readwrite.alias") &&
      (s.includes("meta.import") || s.includes("meta.export")) &&
      line.some((token) => token.content.startsWith('"@ariakit/react'))
    ) {
      if (/^[A-Z]/.test(token.content)) return "component-import";
      return "function-import";
    }
    if (
      s.includes("entity.name.function") &&
      s.includes("meta.function-call")
    ) {
      return "function";
    }
    if (
      s.includes("support.class.component") &&
      s.includes("entity.name.tag")
    ) {
      return "component";
    }
    if (
      s.includes("entity.other.attribute-name") &&
      s.includes("meta.tag.attributes")
    ) {
      return "prop";
    }
    if (
      s.includes("meta.object-literal.key") &&
      s.includes("meta.object.member") &&
      s.includes("meta.objectliteral")
    ) {
      return "prop";
    }
    if (
      s.includes("variable.other.readwrite") &&
      s.includes("meta.object.member") &&
      s.includes("meta.objectliteral")
    ) {
      return "prop";
    }
    if (
      s.includes("entity.name.function") &&
      s.includes("meta.definition.method") &&
      s.includes("meta.method.declaration") &&
      s.includes("meta.objectliteral")
    ) {
      return "prop";
    }
  }

  return null;
}

const references = links.filter((link) => link.path.startsWith("/reference/"));

interface TokenContext {
  contextId: string;
  contextTabLevel: number;
}

function getTokenHref(
  token: IThemedToken,
  line: IThemedToken[],
  context: TokenContext,
) {
  if (/^\s{2,}$/.test(token.content)) {
    const tabLevel = token.content.length / 2;
    if (tabLevel <= context.contextTabLevel) {
      context.contextId = "";
      context.contextTabLevel = 0;
    }
    return;
  }
  const type = getLinkableType(token, line);
  if (!type) return;
  const word = token.content.replace("Ariakit.", "").replace(/\:$/, "");
  const id = type === "prop" ? word.toLowerCase() : kebabCase(word);

  const href =
    type === "prop"
      ? `/reference/${context.contextId}#${id}`
      : `/reference/${id}`;

  if (!isValidHref(href, references)) return;

  if (type === "component" || type === "function") {
    context.contextId = id;
    context.contextTabLevel =
      (line.find((t) => /^\s{2,}$/.test(t.content))?.content.length ?? 0) / 2;
  }

  return href;
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

  let lightTokens: IThemedToken[][] = [];
  let darkTokens: IThemedToken[][] = [];

  if (!highlighter) {
    try {
      highlighter = await getHighlighter({
        themes: ["light-plus", "dark-plus"],
        langs: [
          "javascript",
          "typescript",
          "tsx",
          "jsx",
          "shellscript",
          "css",
          "html",
          "diff",
        ],
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  try {
    lightTokens = highlighter.codeToThemedTokens(code, lang, "light-plus");
    darkTokens = highlighter.codeToThemedTokens(code, lang, "dark-plus");
  } catch (error) {
    console.error(error);
  }

  const oneLiner = darkTokens.length === 1;

  const renderLine = (className = "") => {
    const tokensSeen: Record<string, number> = {};
    const context: TokenContext = { contextId: "", contextTabLevel: 0 };
    return (line: IThemedToken[], i: number) => {
      const highlightLine = highlightLines?.includes(i + 1);
      return (
        <div
          key={i}
          className={twJoin(
            type === "static" && "sm:!px-8",
            type === "static" && lineNumbers && "!pl-0 sm:!pl-0",
            type === "editor" && lineNumbers && "sm:!pl-0",
            type !== "definition" && "px-4 pr-14 sm:pl-[26px]",
            type === "definition" && "px-4",
            highlightLine && "bg-blue-200/20 dark:bg-blue-600/[15%]",
            highlightLine && !lineNumbers && highlightBeforeStyle,
            className,
          )}
        >
          {line.length ? (
            <>
              {line.map((token, j) => {
                const highlightToken = highlightTokens?.some((t) => {
                  const [word, indexes] = Array.isArray(t) ? t : [t];
                  if (token.content !== word) return false;
                  if (!indexes) return token.content === word;
                  if (tokensSeen[word] === undefined) {
                    tokensSeen[word] = 0;
                  }
                  const index = tokensSeen[word]++;
                  return indexes.includes(index);
                });

                const color =
                  !highlightToken && !highlightLine
                    ? token.color
                    : // Adjust contrast for custom component tokens
                    token.color === "#267F99"
                    ? "#227289"
                    : // Adjust contrast for component prop tokens
                    token.color === "#E50000"
                    ? "#CE0000"
                    : token.color;

                const className = twJoin(
                  highlightToken &&
                    "-mx-[3px] rounded bg-black/[7.5%] px-[3px] py-1 dark:bg-white/10",
                  parseFontStyle(token.fontStyle),
                );

                const href =
                  lang &&
                  /[jt]sx?/.test(lang) &&
                  getTokenHref(token, line, context);

                const getScopes = () => {
                  if (process.env.NODE_ENV === "production") return;
                  return token.explanation
                    ?.flatMap((exp) => exp.scopes.map((s) => s.scopeName))
                    .join(" ");
                };

                if (href) {
                  return (
                    <Link
                      key={j}
                      href={href}
                      style={{ color }}
                      className={twJoin(
                        className,
                        "underline decoration-dotted decoration-1 underline-offset-[3px] hover:decoration-solid hover:decoration-2",
                      )}
                      data-scopes={getScopes()}
                    >
                      {token.content}
                    </Link>
                  );
                }

                return (
                  <span
                    key={j}
                    style={{ color }}
                    className={className}
                    data-scopes={getScopes()}
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
    };
  };

  return (
    <div
      className={twMerge(
        type !== "definition" && "w-full",
        "relative max-h-[inherit]",
        className,
      )}
    >
      {type === "static" && (
        <CopyToClipboard
          text={code}
          className={twJoin(
            "absolute right-2 top-2 z-[11] h-[37px] rounded-md bg-transparent px-3",
            "text-sm focus-visible:ariakit-outline-input",
            "text-black/75 hover:bg-black/[7.5%] hover:text-black",
            "dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white",
          )}
        />
      )}
      <pre
        className={twJoin(
          type === "definition" ? "w-max max-w-full py-3" : "w-full pt-4",
          type === "definition" && "rounded-lg",
          type === "static" && !oneLiner && "sm:pt-8",
          type === "static" && "rounded-lg sm:rounded-xl",
          type === "editor" && "rounded-b-lg !border-0 sm:rounded-b-xl",
          !oneLiner && (highlightLines?.length || highlightTokens?.length)
            ? "leading-[26px]"
            : "leading-[21px]",
          "relative z-10 flex max-h-[inherit] overflow-auto text-sm text-black dark:text-white",
          "border border-black/[15%] bg-white dark:border-0 dark:bg-gray-850",
        )}
      >
        {lineNumbers && (
          <div
            aria-hidden
            className={twJoin(
              type === "static" && "flex",
              type === "editor" && "hidden sm:flex",
              "sticky left-0 h-full select-none flex-col bg-inherit text-right",
              "text-[#237893] dark:text-[#858585]",
            )}
          >
            {darkTokens.map((_, i) => {
              const highlighted = highlightLines?.includes(i + 1);
              return (
                <span
                  key={i}
                  className={twJoin(
                    type === "static" && "px-4 sm:pl-8 sm:pr-6",
                    type === "editor" && "min-w-[68px] pl-0 pr-[26px]",
                    highlighted &&
                      "bg-blue-200/20 text-[#0b216f] dark:bg-blue-600/[15%] dark:text-[#c6c6c6]",
                    highlighted && highlightBeforeStyle,
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
          {lightTokens.map(renderLine("block dark:hidden"))}
          {darkTokens.map(renderLine("hidden dark:block"))}
          <div
            className={twJoin(
              type === "static" && !oneLiner && "sm:h-8",
              type !== "definition" && "h-4",
            )}
          />
        </code>
      </pre>
    </div>
  );
}
