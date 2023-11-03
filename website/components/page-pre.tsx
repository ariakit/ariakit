import { Children, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { Element } from "hast";
import parseNumericRange from "parse-numeric-range";
import { twJoin } from "tailwind-merge";
import invariant from "tiny-invariant";
import { CodeBlock } from "./code-block.jsx";

export interface PagePreProps extends ComponentProps<"pre"> {
  node?: Element;
}

export function PagePre({ node, ...props }: PagePreProps) {
  const pre = (
    <pre
      {...props}
      className={twJoin(
        "data-[api]:leading-8 data-[api]:tracking-wide data-[api]:text-black/60 dark:data-[api]:text-white/60",
        props.className,
      )}
    />
  );

  const [child] = Children.toArray(props.children);

  if (!child) return pre;

  type Props = {
    children: ReactNode;
    className?: string;
    meta?: string;
  };

  if (!isValidElement<Props>(child)) return pre;

  if (child.type !== "code") return pre;
  if (!child.props) return pre;
  if (!child.props.children) return pre;
  if (!Array.isArray(child.props.children)) return pre;

  const [code] = child.props.children;
  if (typeof code !== "string") return pre;

  const lang = child.props.className?.replace("language-", "");
  const meta = child.props.meta?.split(" ") || [];
  const lineNumbers = meta.includes("lineNumbers");
  const definition = meta.includes("definition");
  const rangePattern = /^\{([\d\-,]+)\}$/;

  const highlightLines = meta
    .filter((item) => rangePattern.test(item))
    .flatMap((item) => parseNumericRange(item.replace(rangePattern, "$1")));

  const tokenPattern = /^"(.+)"([\d\-,]+)?$/;

  const highlightTokens = meta
    .filter((item) => tokenPattern.test(item))
    .map((item) => {
      const [, token, ranges] = item.match(tokenPattern) || [];
      invariant(token);
      if (!ranges) return token;
      return [token, parseNumericRange(ranges)] as const;
    });

  return (
    <CodeBlock
      type={definition ? "definition" : undefined}
      lang={lang}
      code={code}
      lineNumbers={lineNumbers}
      highlightLines={highlightLines}
      highlightTokens={highlightTokens}
      className={definition ? "" : "!max-w-[832px]"}
    />
  );
}
