import type { ComponentProps } from "react";
import { badge } from "../styles/badge.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface BadgeProps
  extends VariantProps<typeof badge>,
    ComponentProps<"div"> {
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export function Badge(props: BadgeProps) {
  const [variantProps, rest] = badge.splitProps(props);
  return (
    <div {...rest} className={badge(variantProps)}>
      {props.iconStart && (
        <span className={badge.icon({ position: "start" })}>
          {props.iconStart}
        </span>
      )}
      <span className={badge.text()}>{props.children}</span>
      {props.iconEnd && (
        <span className={badge.icon({ position: "end" })}>{props.iconEnd}</span>
      )}
    </div>
  );
}
