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

export function Badge({ iconStart, iconEnd, ...props }: BadgeProps) {
  const [variantProps, textProps, rest] = splitProps(props, badge, badgeText);
  return (
    <div {...badge(variantProps)} {...rest}>
      {iconStart && (
        <span {...badgeIcon({ $position: "start" })}>{iconStart}</span>
      )}
      <span {...badgeText(textProps)}>{props.children}</span>
      {iconEnd && <span {...badgeIcon({ $position: "end" })}>{iconEnd}</span>}
    </div>
  );
}
