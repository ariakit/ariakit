import type { ComponentProps } from "react";
import { cn } from "../lib/cn.ts";
import * as icons from "./icons.ts";

export interface IconProps extends ComponentProps<"svg"> {
  name: keyof typeof icons;
}

export function Icon({ name, ...props }: IconProps) {
  const hasLabel =
    props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
  const { html, viewBox = "0 0 24 24" } = icons[name];
  return (
    <svg
      viewBox={viewBox}
      width="1em"
      height="1em"
      aria-hidden={!hasLabel || undefined}
      stroke="currentColor"
      fill="none"
      {...props}
      dangerouslySetInnerHTML={{ __html: html }}
      className={cn("base:stroke-[1.5] base:ak-dark:stroke-1", props.className)}
    />
  );
}
