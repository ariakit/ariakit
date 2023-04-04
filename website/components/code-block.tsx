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
  const highlighter = await highlighterPromise;

  code = type === "static" ? code.trim() : code;
  const tokens = highlighter.codeToThemedTokens(code, lang);

  const oneLiner = tokens.length === 1;

  return (
    <div className={cx(className, "dark relative w-full [color-scheme:dark]")}>
      {type === "static" && (
        <CopyToClipboard
          text={code}
          className={tw`absolute right-[11px] top-[11px] h-8 rounded px-3 text-sm`}
        />
      )}
      <pre
        className={cx(
          type === "static" && !oneLiner && "sm:pt-8",
          type === "static" && "rounded-lg bg-gray-850 sm:rounded-xl",
          type === "editor" && "rounded-[inherit] bg-[#1e1e1e]",
          tw`flex max-h-[inherit] w-full overflow-auto pt-4 text-sm
        leading-[21px] text-white`
        )}
      >
        {lineNumbers && (
          <div
            className={cx(
              type === "static" && "sm:pl-8 sm:pr-2",
              tw`sticky left-0 flex h-full flex-col bg-inherit pl-4 pr-2
            text-right text-[#858585]`
            )}
          >
            {tokens.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}
        <code
          className={cx(
            type === "static" && "sm:mx-8",
            lineNumbers && "!ml-2",
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
