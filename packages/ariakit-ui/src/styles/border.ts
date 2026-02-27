import { cv } from "clava";

const borderColors = {
  unset: "",
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
     * Whether to add a border to the element. Set to `adaptive` to show the
     * border only in high-contrast mode. Set to `content` to disable the border
     * and ring on the current element and apply them only to children with
     * `$border` set to `inherit`.
     */
    $border: {
      true: "ak-edge-(--border-color)/(--border-weight)",
      inherit: [
        "[@container_not_style(--border-contrast:1)]:ak-edge-(--border-color)/(--border-weight)",
        "[@container_style(--border-contrast:1)]:ak-edge-contrast-(--border-color)",
      ],
      content: "ak-border-0! ak-ring-0!",
    },
    /**
     * Sets the weight of the border.
     */
    $borderWeight: {
      unset: "",
      adaptive: "[--border-weight:0]",
      light: "[--border-weight:5]",
      normal: "[--border-weight:10]",
      medium: "[--border-weight:20]",
      bold: "[--border-weight:40]",
      contrast: "[--border-contrast:1] ak-edge-contrast-(--border-color)",
    },
    /**
     * Sets the element’s border style. `bordering` uses `border` in dark mode
     * and `ring` in light mode, which is usually preferred for elements with a
     * box shadow.
     */
    $borderType: {
      unset: "",
      inherit: "ak-border-(--border-border,0px) ak-ring-(--border-ring,0px)",
      border: [
        "[--border-border:var(--border-width)]",
        "ak-border-(--border-width)",
      ],
      bordering: [
        "ak-light:[--border-backdrop:var(--ak-layer)]",
        "ak-dark:[--border-border:var(--border-width)]",
        "ak-light:[--border-ring:var(--border-width)]",
        "ak-bordering-(--border-width)",
      ],
      ring: [
        "[--border-backdrop:var(--ak-layer)]",
        "[--border-ring:var(--border-width)]",
        "ak-ring-(--border-width)",
      ],
      inset: "ring-(length:--border-width) ring-inset",
      dashed: "ak-border-(--border-width) border-dashed",
      dotted: "ak-border-(--border-width) border-dotted",
    },
  },
  computedVariants: {
    /**
     * Sets the size of the border.
     * @default 1
     */
    $borderWidth: (value: "unset" | number) => {
      if (value === "unset") return;
      return { "--border-width": `${value}px` };
    },
  },
  defaultVariants: {
    $borderType: "border",
    $borderColor: "default",
    $borderWeight: "normal",
    $borderWidth: 1,
  },
  computed: (context) => {
    if (context.variants.$border) {
      if (context.variants.$border === "inherit") {
        context.setDefaultVariants({
          $borderType: "inherit",
          $borderWidth: "unset",
          $borderColor: "unset",
          $borderWeight: "unset",
        });
      }
      if (context.variants.$borderWeight === "contrast") {
        context.setVariants({
          $border: context.variants.$border === "content" ? "content" : false,
        });
      }
    } else {
      context.setVariants({
        $borderType: "unset",
        $borderColor: "unset",
        $borderWeight: "unset",
        $borderWidth: "unset",
      });
    }
  },
});
