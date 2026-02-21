import { cv } from "clava";

export const layer = cv({
  variants: {
    /**
     * Sets the element's background color.
     */
    $bg: {
      unset: "",
      popLightDark: "ak-light:ak-layer-level-0.5 ak-layer-pop",
      pop05: "ak-layer-level-0.5 ak-layer-pop",
      pop: "ak-layer-pop",
      pop2: "ak-layer-level-2 ak-layer-pop",
      light: "ak-layer",
      light2: "ak-layer-level-2 ak-layer",
      dark: "ak-layer-down",
      dark2: "ak-layer-level-2 ak-layer-down",
      parent: "[--layer:var(--ak-layer-parent)] ak-layer-(--layer)",
      invert: "layer-invert ak-layer-invert",
      ghost: "ak-layer-level-0 ak-layer bg-transparent",
      disabled: "ak-layer-level-0.5 ak-layer-pop",
      primary: "[--layer:theme(--color-primary)] ak-layer-(--layer)",
      secondary: "[--layer:theme(--color-secondary)] ak-layer-(--layer)",
      success: "[--layer:theme(--color-success)] ak-layer-(--layer)",
      warning: "[--layer:theme(--color-warning)] ak-layer-(--layer)",
      danger: "[--layer:theme(--color-danger)] ak-layer-(--layer)",
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
        class: "ak-layer-mix/(--background-mix)",
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
