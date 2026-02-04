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
     * Sets the element’s border style. `bordering` uses `border` in dark mode
     * and `ring` in light mode, which is usually preferred for elements with a
     * box shadow.
     */
    $borderType: {
      unset: "",
      border: "ak-border-(--border-width)",
      bordering: "ak-bordering-(--border-width)",
      ring: "ak-ring-(--border-width)",
      inset: "ring-(--border-width) ring-inset",
      dashed: "ak-border-(--border-width) border-dashed",
      dotted: "ak-border-(--border-width) border-dotted",
    },
  },
  computedVariants: {
    /**
     * Sets the size of the border.
     * @default 1
     */
    $borderWidth: (value: number) => ({ "--border-width": `${value}px` }),
  },
  defaultVariants: {
    $borderType: "border",
    $borderColor: "default",
    $borderWidth: 1,
  },
  computed: (context) => {
    if (context.variants.$border) return;
    context.setVariants({ $borderType: "unset" });
  },
});
