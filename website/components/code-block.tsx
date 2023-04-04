import { cx } from "@ariakit/core/utils/misc";
import { FontStyle, getHighlighter } from "shiki";
import { tw } from "website/utils/tw.js";
import { CopyToClipboard } from "./copy-to-clipboard.js";

interface Props {
  code: string;
  lang?: string;
  filename?: string;
  lineNumbers?: boolean;
  type?: "static" | "editor";
  className?: string;
  preClassName?: string;
}

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
  className,
}: Props) {
  code = type === "static" ? code.trim() : code;
  const highlighter = await highlighterPromise;
  const tokens = highlighter.codeToThemedTokens(code, lang, "dark-plus", {
    includeExplanation: false,
  });

  const oneLiner = tokens.length === 1;

  return (
    <div className={cx(className, "relative w-full")}>
      {type === "static" && (
        <CopyToClipboard
          text={code}
          className={tw`absolute right-2 top-2 z-[11] h-[37px] rounded-md px-3
          text-sm !text-white/75 hover:!bg-white/[15%] hover:!text-white
          dark:hover:!bg-white/5`}
        />
      )}
      <pre
        className={cx(
          type === "static" && !oneLiner && "sm:pt-8",
          type === "static" && "rounded-lg bg-gray-850 sm:rounded-xl",
          type === "editor" && "rounded-[inherit] bg-[#1e1e1e]",
          tw`dark relative z-10 flex max-h-[inherit] w-full overflow-auto
        pt-4 text-sm leading-[21px] text-white [color-scheme:dark]`
        )}
      >
        {lineNumbers && (
          <div
            className={cx(
              type === "static" && "flex px-4 sm:pl-8 sm:pr-6",
              type === "editor" && "hidden pl-[21px] pr-[26px] sm:flex",
              tw`sticky left-0 h-full flex-col bg-inherit text-right
            text-[#858585]`
            )}
          >
            {tokens.map((_, i) => (
              <span key={i} className={cx(type === "editor" && "min-w-[27px]")}>
                {i + 1}
              </span>
            ))}
          </div>
        )}
        <code
          className={cx(
            type === "static" && "sm:mx-8",
            type === "static" && lineNumbers && "!ml-0",
            type === "editor" && lineNumbers && "sm:ml-0",
            "mx-4"
          )}
        >
          {tokens.map((line, i) => (
            <span key={i}>
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
            </span>
          ))}
          <div
            className={cx(type === "static" && !oneLiner && "sm:h-8", "h-4")}
          />
        </code>
      </pre>
    </div>
  );
}
