import { cv } from "clava";
import { border } from "./border.ts";
import { field, fieldIcon, fieldText } from "./field.ts";

export const badge = cv({
  extend: [field, border],
  class: [
    "font-medium whitespace-nowrap",
    "ak-layer-mix-(--badge-color)/15",
    "ak-dark:ak-edge-(--badge-color) ak-light:ak-edge-(--badge-color)/15",
  ],
  variants: {
    $color: {
      default: "[--badge-color:theme(--color-gray-500)]",
      primary: "[--badge-color:theme(--color-primary)]",
      secondary: "[--badge-color:theme(--color-secondary)]",
      success: "[--badge-color:theme(--color-green-500)]",
      warning: "[--badge-color:theme(--color-yellow-500)]",
      danger: "[--badge-color:theme(--color-red-500)]",
    },
  },
  defaultVariants: {
    $color: "default",
    $size: "xs",
    $frame: "badge",
  },
});

export const badgeText = cv({
  extend: [fieldText],
  class: "ak-text-(--badge-color)/70",
});

export const badgeIcon = cv({
  extend: [fieldIcon],
  class: "ak-text-(--badge-color)/70",
});
