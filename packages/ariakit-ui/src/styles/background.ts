import { cv } from "clava";

export const background = cv({
  variants: {
    /**
     * Sets the element's background color.
     */
    $bg: {
      none: "",
      pop: "[--background-color:var(--ak-layer)] ak-layer-pop",
      lighter: "[--background-color:var(--ak-layer)] ak-layer",
      darker: "[--background-color:var(--ak-layer)] ak-layer-down",
      invert:
        "[--background-color:var(--ak-layer)] background-invert ak-layer-invert",
      ghost: "[--background-color:var(--ak-layer)] ak-layer-0 bg-transparent",
      disabled: "[--background-color:var(--ak-layer)] ak-layer-pop-0.5",
      primary: "[--background-color:theme(--color-primary)] ak-layer-primary",
      secondary:
        "[--background-color:theme(--color-secondary)] ak-layer-secondary",
      success: "[--background-color:theme(--color-success)] ak-layer-success",
      warning: "[--background-color:theme(--color-warning)] ak-layer-warning",
      danger: "[--background-color:theme(--color-danger)] ak-layer-danger",
    },
    /**
     * Whether to force the background color to have enough contrast with the
     * parent layer.
     */
    $contrast: "ak-layer-contrast",
  },
  computedVariants: {
    /**
     * Sets the mix of the background color with the parent layer.
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
      return setVariants({ $contrast: false });
    }
  },
});
