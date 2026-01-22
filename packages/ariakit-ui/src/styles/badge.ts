import { cv } from "clava";
import type { Variant } from "../index.ts";
import { control, controlIcon, controlLabel } from "./control.ts";

const badgeColors = {
  default: "",
  primary: "[--badge-color:theme(--color-primary)]",
  secondary: "[--badge-color:theme(--color-secondary)]",
  success: "[--badge-color:theme(--color-success)]",
  warning: "[--badge-color:theme(--color-warning)]",
  danger: "[--badge-color:theme(--color-danger)]",
} satisfies Variant<typeof control, "$borderColor">;

export const badge = cv({
  extend: [control],
  class: "font-medium",
  variants: {
    $bg: badgeColors,
  },
  defaultVariants: {
    $bg: "pop",
    $size: "xs",
    $radius: "badge",
    $border: "adaptive",
    $borderType: "inset",
    $px: "lg",
    $mix: 15,
  },
  computed: (context) => {
    if (!context.variants.$bg) return;
    const badgeColorKeys = Object.keys(badgeColors);
    if (badgeColorKeys.includes(context.variants.$bg)) {
      context.setDefaultVariants({
        $borderColor: context.variants.$bg as keyof typeof badgeColors,
      });
    }
  },
});

export const badgeText = cv({
  extend: [controlLabel],
  class: "ak-text-(--badge-color)/70",
});

export const badgeIcon = cv({
  extend: [controlIcon],
  class: "ak-text-(--badge-color)/70",
});
