import type { Element } from "hast";
import parseNumericRange from "parse-numeric-range";
import type { ComponentProps, ReactNode } from "react";
import { Children, isValidElement } from "react";
import { twJoin } from "tailwind-merge";
import invariant from "tiny-invariant";
import { defer } from "@/lib/defer.ts";
import { CodeBlock } from "./code-block.tsx";

export interface PagePreProps extends ComponentProps<"pre"> {
  node?: Element;
  hovercards?: Set<Promise<string | Iterable<string>>>;
}

export function PagePre({ node, hovercards, ...props }: PagePreProps) {
  const pre = (
    <pre
      {...props}
      className={twJoin(
        "w-full max-w-[--size-content]",
        "data-[api]:leading-8 data-[api]:tracking-wide data-[api]:text-black/60 dark:data-[api]:text-white/60",
        props.className,
      )}
    />
  );

  const [child] = Children.toArray(props.children);

  if (!child) return pre;

  interface ElementProps {
    children: ReactNode;
    className?: string;
    meta?: string;
  }

  if (!isValidElement<ElementProps>(child)) return pre;

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

  const deferred = defer<Iterable<string>>();
  hovercards?.add(deferred);

  return (
    <CodeBlock
      type={definition ? "definition" : undefined}
      lang={lang}
      code={code}
      lineNumbers={lineNumbers}
      highlightLines={highlightLines}
      highlightTokens={highlightTokens}
      className={definition ? "max-w-[--size-content]" : "max-w-[--size-lg]"}
      onRender={deferred.resolve}
    />
  );
}
