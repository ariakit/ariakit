import { cv } from "../utils/cv.ts";
import { command } from "./command.ts";
import { icon } from "./icon.ts";
import { outline } from "./outline.ts";

export const button = Object.assign(
  cv({
    extend: [command, outline],
    class: [
      "[--px:calc(var(--ak-frame-padding)*1.25)]",
      "[--py:calc(var(--ak-frame-padding)-(1lh-1em)/2)]",
      "flex font-[calc(500+50*var(--contrast))] leading-[1.5em] px-(--px) py-(--py) gap-[calc(var(--ak-frame-padding)/2)]",
      "ak-frame-field ak-outline-primary",
      "ak-hover:ak-layer-hover",
      "ak-disabled:ak-text/50 ak-disabled:ak-layer-mix ak-disabled:border-transparent ak-disabled:inset-shadow-none ak-disabled:bg-none ak-disabled:shadow-none",
    ],
    variants: {
      variant: {
        default: "ak-layer-pop",
        ghost: "ak-layer-0",
        primary: "ak-layer-primary",
        secondary: "ak-layer-secondary",
        success: "ak-layer-success",
        warning: "ak-layer-warning",
        danger: "ak-layer-danger",
      },
      size: {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }),
  {
    icon,
    text: cv({
      variants: {
        truncate: {
          true: "truncate",
        },
      },
    }),
  },
);
