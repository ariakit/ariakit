import { cv } from "../utils/cv.ts";
import { icon } from "./icon.ts";
import { outline } from "./outline.ts";

export const badge = Object.assign(
  cv({
    extend: [outline],
    class: [
      "[--px:calc(var(--ak-frame-padding)*1.5)]",
      "[--py:calc(var(--ak-frame-padding)-(1lh-1em)/2)]",
      "flex font-medium whitespace-nowrap px-(--px) py-(--py) gap-(--ak-frame-padding)",
      "ak-frame-badge ak-layer-mix-(--badge-color)/15",
      "ak-dark:ak-edge-(--badge-color) ak-light:ak-edge-(--badge-color)/15",
    ],
    variants: {
      variant: {
        default: "[--badge-color:var(--color-gray-500)]",
        primary: "[--badge-color:var(--color-primary)]",
        secondary: "[--badge-color:var(--color-secondary)]",
        success: "[--badge-color:var(--color-green-500)]",
        warning: "[--badge-color:var(--color-yellow-500)]",
        danger: "[--badge-color:var(--color-red-500)]",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }),
  {
    text: cv({
      class: "ak-text-(--badge-color)/70",
      variants: {
        truncate: {
          true: "truncate",
        },
      },
    }),
    icon: cv({
      extend: [icon],
      class: "ak-text-(--badge-color)/70",
    }),
  },
);
