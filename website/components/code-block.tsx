import { cx } from "@ariakit/core/utils/misc";
import { FontStyle, getHighlighter } from "shiki";
import { tw } from "utils/tw.js";
import { CopyToClipboard } from "./copy-to-clipboard.js";

interface Props {
  code: string;
  lang?: string;
  filename?: string;
  lineNumbers?: boolean;
  highlightLines?: number[];
  type?: "static" | "editor";
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

const highlighterPromise = getHighlighter({
  theme: "dark-plus",
  langs: ["javascript", "typescript", "tsx", "jsx", "sh", "css", "html"],
});

export async function CodeBlock({
  code,
  filename,
  lang = getExtension(filename),
  type = "static",
  lineNumbers = type === "editor",
  highlightLines,
  className,
}: Props) {
  code = type === "static" ? code.trim() : code;
  const highlighter = await highlighterPromise;

  const tokens = highlighter.codeToThemedTokens(code, lang, "dark-plus", {
    includeExplanation: false,
  });

  const oneLiner = tokens.length === 1;

  return (
    <div className={cx(className, "relative max-h-[inherit] w-full")}>
      {type === "static" && (
        <CopyToClipboard
          text={code}
          className={tw`
          absolute right-2 top-2 z-[11] h-[37px] rounded-md bg-transparent px-3
          text-sm text-white/75 hover:bg-white/[15%] hover:text-white
          focus-visible:ariakit-outline-input dark:hover:!bg-white/5`}
        />
      )}
      <pre
        className={cx(
          type === "static" && !oneLiner && "sm:pt-8",
          type === "static" && "rounded-lg bg-gray-850 sm:rounded-xl",
          type === "editor" && "rounded-b-lg bg-[#1e1e1e] sm:rounded-b-xl",
          highlightLines?.length ? "leading-[26px]" : "leading-[21px]",
          tw`
          relative z-10 flex max-h-[inherit] w-full overflow-auto
          pt-4 text-sm text-white [color-scheme:dark]`
        )}
      >
        {lineNumbers && (
          <div
            aria-hidden
            className={cx(
              type === "static" && "flex",
              type === "editor" && "hidden sm:flex",
              tw`sticky left-0 h-full select-none flex-col bg-inherit
            text-right text-[#858585]`
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
        <code className="grid w-full">
          {tokens.map((line, i) => {
            const highlighted = highlightLines?.includes(i + 1);
            return (
              <div
                key={i}
                className={cx(
                  type === "static" && "sm:!px-8",
                  type === "static" && lineNumbers && "!pl-0 sm:!pl-0",
                  type === "editor" && lineNumbers && "sm:!pl-0",
                  highlighted && "bg-blue-600/20 dark:bg-blue-600/[15%]",
                  highlighted && !lineNumbers && style.highlightBefore,
                  "px-4 pr-14 sm:pl-[26px]"
                )}
              >
                {line.length ? (
                  <>
                    {line.map((token, j) => (
                      <span
                        key={j}
                        style={{ color: token.color }}
                        className={parseFontStyle(token.fontStyle)}
                      >
                        {token.content}
                      </span>
                    ))}
                    {"\n"}
                  </>
                ) : (
                  "\n"
                )}
              </div>
            );
          })}
          <div
            className={cx(type === "static" && !oneLiner && "sm:h-8", "h-4")}
          />
        </code>
      </pre>
    </div>
  );
}
