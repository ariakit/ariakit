import type { ComponentProps } from "react";
import { cn } from "../lib/cn.ts";
import * as icons from "./icons.ts";

export interface IconProps extends ComponentProps<"svg"> {
  name: keyof typeof icons;
}

export function Icon({ name, ...props }: IconProps) {
  const hasLabel =
    props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden={!hasLabel || undefined}
      stroke="currentColor"
      fill="none"
      {...props}
      dangerouslySetInnerHTML={{ __html: icons[name] }}
      className={cn("stroke-[1.5] ak-dark:stroke-1", props.className)}
    />
  );
}
