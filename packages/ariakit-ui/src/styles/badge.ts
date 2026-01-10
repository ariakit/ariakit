import { cv } from "clava";
import { border } from "./border.ts";
import { icon } from "./icon.ts";

export const badge = cv({
  extend: [border],
  class: [
    "[--px:calc(var(--ak-frame-padding)*1.5)]",
    "[--py:calc(var(--ak-frame-padding)-(1lh-1em)/2)]",
    "flex font-medium whitespace-nowrap px-(--px) py-(--py) gap-[calc(var(--ak-frame-padding)/2)]",
    "ak-frame-badge ak-layer-mix-(--badge-color)/15",
    "ak-dark:ak-edge-(--badge-color) ak-light:ak-edge-(--badge-color)/15",
  ],
  variants: {
    $variant: {
      default: "[--badge-color:theme(--color-gray-500)]",
      primary: "[--badge-color:theme(--color-primary)]",
      secondary: "[--badge-color:theme(--color-secondary)]",
      success: "[--badge-color:theme(--color-green-500)]",
      warning: "[--badge-color:theme(--color-yellow-500)]",
      danger: "[--badge-color:theme(--color-red-500)]",
    },
    $size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    $variant: "default",
    $size: "sm",
  },
});

export const badgeText = cv({
  class: "ak-text-(--badge-color)/70",
  variants: {
    $truncate: "truncate",
  },
});

export const badgeIcon = cv({
  extend: [icon],
  class: "ak-text-(--badge-color)/70",
});
