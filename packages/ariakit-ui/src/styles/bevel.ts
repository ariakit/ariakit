import { cv } from "clava";
import { layer } from "./layer.ts";

export const bevel = cv({
  extend: [layer],
  variants: {
    $kind: {
      bevel: [
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
      ],
    },
    /**
     * Whether the bevel style is applied to a button and therefore should
     * account for hover and active states.
     */
    $bevelButton: [
      "ui-hover:[--min-l:0.35] ak-dark:ui-hover:[--min-l:0.25]",
      "ui-hover:[--max-l:1] ak-dark:ui-hover:[--max-l:1]",
      "ui-active:[--bg-dark-active:oklch(from_var(--ak-layer)_calc(l-0.02)_c_h)] ak-dark:ui-active:[--bg-dark-active:oklch(from_var(--ak-layer)_calc(l-0.02)_c_h)]",
      "ui-active:[--bg-light-active:oklch(from_var(--ak-layer)_calc(l+0.02)_c_h)] ak-dark:ui-active:[--bg-light-active:oklch(from_var(--ak-layer)_calc(l+0.02)_c_h)]",
      "ui-active:[--shadow:0_1px_0.5px_1px_var(--shadow-color)] ak-dark:ui-active:[--shadow:0_0.5px_0.5px_var(--shadow-color)]",
      "ui-active:[--highlight:0_0_transparent]",
      "ui-active:from-60% ui-active:from-(--bg-dark-active) ui-active:to-(--bg-light-active)",
    ],
  },
  computed: ({ variants, setVariants, setDefaultVariants }) => {
    const $bg = variants.$kind === "bevel" ? "light2" : (variants.$bg ?? "pop");
    setDefaultVariants({ $bg });
    // Apply button states only when using the bevel kind.
    const $bevelButton =
      variants.$kind !== "bevel" ? false : variants.$bevelButton;
    setVariants({ $bevelButton });
  },
});
