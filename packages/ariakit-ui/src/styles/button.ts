import { cv } from "../utils/cv.ts";
import { command } from "./command.ts";
import { icon } from "./icon.ts";
import { outline } from "./outline.ts";

export const button = Object.assign(
  cv({
    extend: [command, outline],
    class: [
      "group/button",
      "[--px:calc(var(--ak-frame-padding)*1.25)]",
      "[--py:calc(var(--ak-frame-padding)-(1lh-1em)/2)]",
      "flex font-[calc(500+50*var(--contrast))] leading-[1.5em] px-(--px) py-(--py) gap-[calc(var(--ak-frame-padding)/2)]",
      "ak-frame-field ak-outline-primary",
      "ak-hover:ak-layer-hover",
      "ak-focus-visible:outline-2",
      "ak-disabled:ak-text/50 ak-disabled:ak-layer-mix ak-disabled:border-transparent ak-disabled:inset-shadow-none ak-disabled:bg-none ak-disabled:shadow-none",
    ],
    variants: {
      variant: {
        default: "",
        ghost: "ak-layer-0",
        primary: "ak-layer-primary outline-offset-1",
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
      square: {
        true: "[--px:0]! [--py:0]! square size-[2.5em] items-center justify-center",
      },
      classic: {
        true: [
          "[--min-l:0.25] ak-dark:[--min-l:0.15]",
          "[--max-l:1] ak-dark:[--max-l:0.85]",
          "[--bg-dark-l:calc(l-0.02-0.1*c)] ak-dark:[--bg-dark-l:l]",
          "[--bg-light-l:calc(l+0.01)]",
          "[--bg-dark:oklch(from_var(--ak-layer)_clamp(var(--min-l),var(--bg-dark-l),var(--max-l))_c_h)]",
          "[--bg-light:oklch(from_var(--ak-layer)_clamp(var(--min-l),var(--bg-light-l),var(--max-l))_c_h)]",
          "[--shadow-color:oklch(from_var(--bg-dark)_calc(l-0.15)_c_h)]",
          "[--shadow:0-0.5px_0.5px_1px_var(--shadow-color)]",
          "[--highlight:0_2px_0.5px_oklch(from_var(--bg-dark)_calc(l+0.2)_calc(c/2)_h)] ak-dark:[--highlight:0_1.5px_0.5px_oklch(from_var(--bg-dark)_calc(l+0.1)_c_h)]",
          "[--inset-shadow:var(--shadow),inset_var(--highlight)]",
          "inset-shadow-(--inset-shadow) from-(--bg-dark) to-(--bg-light) bg-linear-to-b from-50% bg-clip-padding outline-offset-1",
          "ak-hover:[--min-l:0.35] ak-dark:ak-hover:[--min-l:0.25]",
          "ak-hover:[--max-l:1] ak-dark:ak-hover:[--max-l:1]",
          "ak-active:[--bg-dark-active:oklch(from_var(--ak-layer)_calc(l-0.02)_c_h)] ak-dark:ak-active:[--bg-dark-active:oklch(from_var(--ak-layer)_calc(l-0.02)_c_h)]",
          "ak-active:[--bg-light-active:oklch(from_var(--ak-layer)_calc(l+0.02)_c_h)] ak-dark:ak-active:[--bg-light-active:oklch(from_var(--ak-layer)_calc(l+0.02)_c_h)]",
          "ak-active:[--shadow:0_1px_0.5px_1px_var(--shadow-color)] ak-dark:ak-active:[--shadow:0_1px_0.5px_var(--shadow-color)]",
          "ak-active:[--highlight:0_0_transparent]",
          "ak-active:from-60% ak-active:from-(--bg-dark-active) ak-active:to-(--bg-light-active)",
        ],
      },
    },
    compoundVariants: [
      { variant: "default", classic: true, class: "ak-layer" },
      { variant: "default", classic: false, class: "ak-layer-pop" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      classic: false,
    },
  }),
  {
    icon,
    text: cv({
      class: "group-[.square]/button:sr-only",
      variants: {
        truncate: {
          true: "truncate",
        },
      },
    }),
  },
);
