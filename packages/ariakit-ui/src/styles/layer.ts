import { cv } from "clava";

export const layer = cv({
  class: "ak-layer",
  variants: {
    /**
     * Sets the element's background color.
     */
    $bg: {
      unset: "",
      popLightDark: "ak-layer-3",
      pop05: "ak-layer-3",
      pop: "ak-layer-6",
      pop2: "ak-layer-12",
      light: "ak-layer-lighten-6",
      light2: "ak-layer-lighten-12",
      dark: "ak-layer-darken-6",
      dark2: "ak-layer-darken-12",
      parent: "[--layer:var(--ak-layer-parent)] ak-layer-(color:--layer)",
      invert: "layer-invert ak-layer-invert",
      ghost: "bg-transparent",
      disabled: "ak-layer-3",
      primary: "[--layer:theme(--color-primary)] ak-layer-(color:--layer)",
      secondary: "[--layer:theme(--color-secondary)] ak-layer-(color:--layer)",
      success: "[--layer:theme(--color-success)] ak-layer-(color:--layer)",
      warning: "[--layer:theme(--color-warning)] ak-layer-(color:--layer)",
      danger: "[--layer:theme(--color-danger)] ak-layer-(color:--layer)",
    },
    /**
     * Whether to force the background color to have enough contrast with the
     * parent layer.
     */
    $contrast: "ak-layer-contrast",
  },
  computedVariants: {
    /**
     * Sets how much the background color blends with the parent layer. The
     * value is the percentage of the background color mixed into the parent
     * layer.
     */
    $mix: (value: number | boolean) => {
      if (value === false) return;
      if (value === true) return "ak-layer-mix";
      return {
        "--background-mix": `${value}%`,
        class: "ak-layer-mix-(--background-mix)",
      };
    },
  },
  computed: ({ variants, setVariants }) => {
    // Ghost background doesn't support contrast
    if (variants.$contrast && variants.$bg === "ghost") {
      setVariants({ $contrast: false });
    }
  },
});
