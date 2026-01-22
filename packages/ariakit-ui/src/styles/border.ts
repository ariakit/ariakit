import { cv } from "clava";

export const border = cv({
  variants: {
    /**
     * Whether to add a border to the element and how thick it should be. Set to
     * `adaptive` to show the border only in high-contrast mode.
     */
    $border: {
      adaptive: "ak-edge-(--border-color)/0",
      light: "ak-edge-(--border-color)/5",
      true: "ak-edge-(--border-color)",
      medium: "ak-edge-(--border-color)/20",
      bold: "ak-edge-(--border-color)/40",
      contrast: "ak-edge-contrast-(--border-color)",
    },
    /**
     * Sets the border color of the element.
     */
    $borderColor: {
      default: "[--border-color:var(--ak-layer)]",
      primary: "[--border-color:theme(--color-primary)]",
      secondary: "[--border-color:theme(--color-secondary)]",
      success: "[--border-color:theme(--color-green-500)]",
      warning: "[--border-color:theme(--color-yellow-500)]",
      danger: "[--border-color:theme(--color-red-500)]",
    },
    /**
     * Sets the border type of the element. `bordering` uses `border` on dark
     * mode and `ring` on light mode.
     */
    $borderType: {
      none: "",
      border: "ak-border",
      bordering: "ak-bordering",
      ring: "ring",
      inset: "ring ring-inset",
      dashed: "ak-border border-dashed",
      dotted: "ak-border border-dotted",
    },
  },
  defaultVariants: {
    $border: false,
    $borderType: "border",
    $borderColor: "default",
  },
  computed: (context) => {
    if (!context.variants.$border) {
      context.setVariants({ $borderType: "none" });
    }
  },
});
