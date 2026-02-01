import { cv } from "clava";

const borderColors = {
  default: "[--border-color:var(--ak-layer)]",
  primary: "[--border-color:var(--color-primary)]",
  secondary: "[--border-color:var(--color-secondary)]",
  success: "[--border-color:var(--color-success)]",
  warning: "[--border-color:var(--color-warning)]",
  danger: "[--border-color:var(--color-danger)]",
};

export function isBorderColor(
  color?: string,
): color is keyof typeof borderColors {
  return !!color && color in borderColors;
}

export const border = cv({
  variants: {
    /**
     * Sets the border color of the element.
     */
    $borderColor: borderColors,
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
     * Sets the border type of the element. `bordering` uses `border` on dark
     * mode and `ring` on light mode.
     */
    $borderType: {
      none: "",
      border: "ak-border",
      bordering: "ak-bordering",
      ring: "ak-ring",
      inset: "ring ring-inset",
      dashed: "ak-border border-dashed",
      dotted: "ak-border border-dotted",
    },
  },
  defaultVariants: {
    $borderType: "border",
    $borderColor: "default",
  },
  computed: (context) => {
    if (!context.variants.$border) {
      context.setVariants({ $borderType: "none" });
    }
  },
});
