import { cv } from "clava";
import { border } from "./border.ts";
import { command } from "./command.ts";
import { field, fieldIcon, fieldText } from "./field.ts";

export const button = cv({
  extend: [field, command, border],
  class: [
    "font-[calc(500+50*var(--contrast))]",
    "ak-outline-primary",
    "ak-hover:ak-layer-hover",
    "ak-focus-visible:outline-2",
    "ak-disabled:cursor-not-allowed ak-disabled:ak-text/0! ak-disabled:border-transparent! ak-disabled:ring-transparent! ak-disabled:ak-layer-pop-0.5! ak-disabled:inset-shadow-none! ak-disabled:bg-none! ak-disabled:shadow-none!",
  ],
  variants: {
    $color: {
      pop: "ak-layer-pop",
      lighter: "ak-layer",
      ghost: "ak-layer-0 ak-disabled:ak-layer-0!",
      primary: "ak-layer-primary outline-offset-1",
      secondary: "ak-layer-secondary outline-offset-1",
      danger: "ak-layer-red-600 ak-dark:ak-layer-mix-red-500 outline-offset-1",
    },
    $kind: {
      flat: "",
      classic: [
        "[--min-l:0.25] ak-dark:[--min-l:0.15]",
        "[--max-l:1] ak-dark:[--max-l:0.85]",
        "[--bg-dark-l:calc(l-0.02-0.1*c)] ak-dark:[--bg-dark-l:l]",
        "[--bg-light-l:calc(l+0.01)]",
        "[--bg-dark:oklch(from_var(--ak-layer)_clamp(var(--min-l),var(--bg-dark-l),var(--max-l))_c_h)]",
        "[--bg-light:oklch(from_var(--ak-layer)_clamp(var(--min-l),var(--bg-light-l),var(--max-l))_c_h)]",
        "[--shadow-color:oklch(from_var(--bg-dark)_calc(l-0.15)_c_h)]",
        "[--shadow:0_-0.5px_0.5px_1px_var(--shadow-color)] ak-dark:[--shadow:0_-0.5px_0.5px_var(--shadow-color)]",
        "[--highlight:0_2px_0.5px_oklch(from_var(--bg-dark)_calc(l+0.2)_calc(c/2)_h)] ak-dark:[--highlight:0_1px_0.5px_oklch(from_var(--bg-dark)_calc(l+0.1)_c_h)]",
        "[--inset-shadow:var(--shadow),inset_var(--highlight)]",
        "inset-shadow-(--inset-shadow) from-(--bg-dark) to-(--bg-light) bg-linear-to-b from-50% bg-clip-padding outline-offset-1",
        "ak-hover:[--min-l:0.35] ak-dark:ak-hover:[--min-l:0.25]",
        "ak-hover:[--max-l:1] ak-dark:ak-hover:[--max-l:1]",
        "ak-active:[--bg-dark-active:oklch(from_var(--ak-layer)_calc(l-0.02)_c_h)] ak-dark:ak-active:[--bg-dark-active:oklch(from_var(--ak-layer)_calc(l-0.02)_c_h)]",
        "ak-active:[--bg-light-active:oklch(from_var(--ak-layer)_calc(l+0.02)_c_h)] ak-dark:ak-active:[--bg-light-active:oklch(from_var(--ak-layer)_calc(l+0.02)_c_h)]",
        "ak-active:[--shadow:0_1px_0.5px_1px_var(--shadow-color)] ak-dark:ak-active:[--shadow:0_0.5px_0.5px_var(--shadow-color)]",
        "ak-active:[--highlight:0_0_transparent]",
        "ak-active:from-60% ak-active:from-(--bg-dark-active) ak-active:to-(--bg-light-active)",
      ],
    },
  },
  defaultVariants: {
    $kind: "flat",
  },
  computed: (context) => {
    if (!context.variants.$color) {
      context.setDefaultVariants({
        $color: context.variants.$kind === "classic" ? "lighter" : "pop",
      });
    }
  },
});

export const buttonIcon = fieldIcon;

export const buttonText = cv({
  extend: [fieldText],
  defaultVariants: {
    $truncate: true,
  },
});
