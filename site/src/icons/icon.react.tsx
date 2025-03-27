import type { ComponentProps } from "react";
import { useId } from "react";
import { cn } from "../lib/cn.ts";
import * as icons from "./icons.ts";

export interface IconProps extends ComponentProps<"svg"> {
  name: keyof typeof icons;
}

export function Icon({ name, ...props }: IconProps) {
  const id = useId();
  const hasLabel =
    props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
  const { html, stroke, replaceId, fill, viewBox = "0 0 24 24" } = icons[name];

  let content = html;

  if (replaceId) {
    content = content.replace(/<replace-id-(\d+)>/g, `${id}$1`);
  }

  return (
    <svg
      viewBox={viewBox}
      width="1em"
      height="1em"
      aria-hidden={!hasLabel || undefined}
      stroke={stroke}
      fill={fill}
      {...props}
      dangerouslySetInnerHTML={{ __html: content }}
      className={cn("base:stroke-[1.5] base:ak-dark:stroke-1", props.className)}
    />
  );
}
