import { cv } from "clava";

export const background = cv({
  variants: {
    /**
     * Sets the background color of the element.
     */
    $bg: {
      none: "",
      pop: "ak-layer-pop",
      lighter: "ak-layer",
      darker: "ak-layer-down",
      invert: "background-invert ak-layer-invert",
      ghost: "ak-layer-0 bg-transparent",
      disabled: "ak-layer-pop-0.5",
      primary: "ak-layer-primary",
      secondary: "ak-layer-secondary",
      success: "ak-layer-success",
      warning: "ak-layer-warning",
      danger: "ak-layer-danger",
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
