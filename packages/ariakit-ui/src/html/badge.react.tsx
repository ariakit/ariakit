import type { ComponentProps } from "react";
import { badge } from "../styles/badge.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badge>,
    VariantProps<typeof badge.text> {
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export function Badge(props: BadgeProps) {
  const [variantProps, badgeRest] = badge.splitProps(props);
  const [textProps, rest] = badge.text.splitProps(badgeRest);
  return (
    <div {...rest} className={badge(variantProps)}>
      {props.iconStart && (
        <span className={badge.icon({ position: "start" })}>
          {props.iconStart}
        </span>
      )}
      <span className={badge.text(textProps)}>{props.children}</span>
      {props.iconEnd && (
        <span className={badge.icon({ position: "end" })}>{props.iconEnd}</span>
      )}
    </div>
  );
}
