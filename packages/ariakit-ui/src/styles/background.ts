import { cv } from "clava";

export const background = cv({
  variants: {
    /**
     * Sets the element's background color.
     */
    $bg: {
      unset: "",
      popLightDark: "ak-layer-pop-0.5 ak-dark:ak-layer-pop",
      pop05: "ak-layer-pop-0.5",
      pop: "ak-layer-pop",
      pop2: "ak-layer-pop-2",
      light: "ak-layer",
      light2: "ak-layer-2",
      dark: "ak-layer-down",
      dark2: "ak-layer-down-2",
      parent: "ak-layer-(--ak-layer-parent)",
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
