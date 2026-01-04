import { cv } from "../utils/cv.ts";

export const badge = Object.assign(
  cv({
    class: [
      "flex items-center font-medium whitespace-nowrap",
      "ak-frame-badge/[0.5em]",
      "ak-layer-mix-(--ak-badge-color)/15",
      "ak-dark:ak-edge-(--ak-badge-color) ak-light:ak-edge-(--ak-badge-color)/15",
      "[--ak-frame-px:calc(var(--ak-frame-padding)*1.75)]",
      "px-(--ak-frame-px)",
      "gap-(--ak-frame-padding)",
    ],
    variants: {
      variant: {
        primary: "[--ak-badge-color:var(--color-primary)]",
        secondary: "[--ak-badge-color:var(--color-secondary)]",
        success: "[--ak-badge-color:var(--color-green-500)]",
        warning: "[--ak-badge-color:var(--color-yellow-500)]",
        danger: "[--ak-badge-color:var(--color-red-500)]",
      },
      size: {
        sm: "text-xs/[100%]",
        md: "text-sm/[100%]",
        lg: "text-base/[100%]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  }),
  {
    text: cv({
      class: ["ak-text-(--ak-badge-color)/70"],
    }),
    icon: cv({
      class: "flex-none *:block ak-text-(--ak-badge-color)/70",
      variants: {
        position: {
          start: "ms-[calc(var(--ak-frame-padding)-var(--ak-frame-px))]",
          end: "me-[calc(var(--ak-frame-padding)-var(--ak-frame-px))]",
        },
      },
    }),
  },
);
