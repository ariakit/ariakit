import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { badge, badgeIcon, badgeText } from "../styles/badge.ts";

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badge>,
    VariantProps<typeof badgeText> {
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export function Badge(props: BadgeProps) {
  const [variantProps, textProps, rest] = splitProps(props, badge, badgeText);
  return (
    <div {...badge(variantProps)} {...rest}>
      {props.iconStart && (
        <span {...badgeIcon({ $position: "start" })}>{props.iconStart}</span>
      )}
      <span {...badgeText(textProps)}>{props.children}</span>
      {props.iconEnd && (
        <span {...badgeIcon({ $position: "end" })}>{props.iconEnd}</span>
      )}
    </div>
  );
}
