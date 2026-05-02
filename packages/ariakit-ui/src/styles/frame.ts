import { cv } from "clava";
import { layer } from "./layer.ts";

function getSpacingValue(value: string | number) {
  return typeof value === "string"
    ? value
    : `calc(var(--spacing) * (${value}))`;
}

export const frame = cv({
  extend: [layer],
  variants: {
    /**
     * Enables the frame system, which allows you to set the element's radius,
     * padding, margin, borders, and concentric-radius layout.
     */
    $frame: "ak-frame",
    $force: "ak-frame-force",
    $cover: "ak-frame-cover",
    /**
     * Sets the element’s border radius.
     */
    $rounded: {
      unset: "",
      false: "ak-frame-none",
      xs: "ak-frame-xs",
      sm: "ak-frame-sm",
      md: "ak-frame-md",
      lg: "ak-frame-lg",
      xl: "ak-frame-xl",
      "2xl": "ak-frame-2xl",
      "3xl": "ak-frame-3xl",
      "4xl": "ak-frame-4xl",
      full: "ak-frame-full",
    },
    $borderColor: {
      unset: "",
      brand: "ak-edge-brand",
      success: "ak-edge-success",
      warning: "ak-edge-warning",
      danger: "ak-edge-danger",
    },
    $borderRaw: "[--border-weight:1] [--border-lightness:0] ak-edge-raw",
    $borderWeight: {
      unset: "",
      adaptive: "[--border-weight:0] ak-edge-alpha-(--border-weight)",
      light: "[--border-weight:0.05] ak-edge-alpha-(--border-weight)",
      normal: "[--border-weight:0.1] ak-edge-alpha-(--border-weight)",
      medium: "[--border-weight:0.2] ak-edge-alpha-(--border-weight)",
      bold: "[--border-weight:0.4] ak-edge-alpha-(--border-weight)",
    },
    $borderType: {
      unset: "",
      inherit:
        "ak-frame-border-(--border-border,0px) ak-frame-ring-(--border-ring,0px)",
      border: [
        "[--border-border:var(--border-width)]",
        "ak-frame-border-(--border-width)",
      ],
      bordering: [
        "ak-light:[--border-backdrop:var(--ak-layer)]",
        "ak-dark:[--border-border:var(--border-width)]",
        "ak-light:[--border-ring:var(--border-width)]",
        "ak-frame-bordering-(--border-width)",
      ],
      ring: [
        "[--border-backdrop:var(--ak-layer)]",
        "[--border-ring:var(--border-width)]",
        "ak-frame-ring-(--border-width)",
      ],
      inset: "ring-(length:--border-width) ring-inset",
      dashed: "ak-frame-border-(--border-width) border-dashed",
      dotted: "ak-frame-border-(--border-width) border-dotted",
    },
  },
  computedVariants: {
    $p: (value?: "unset" | "none" | (string & {}) | number) => {
      if (value == null) return;
      if (value === "unset") return;
      if (value === "none") return "ak-frame-p-0";
      return {
        style: { "--frame-padding": getSpacingValue(value) },
        class: "ak-frame-p-(--frame-padding)",
      };
    },
    $m: (value?: "unset" | "none" | (string & {}) | number) => {
      if (value == null) return;
      if (value === "unset") return;
      if (value === "none") return "ak-frame-m-0";
      return {
        style: { "--frame-margin": getSpacingValue(value) },
        class: "ak-frame-m-(--frame-margin)",
      };
    },
    $border: (value?: "inherit" | boolean | number) => {
      if (!value) return;
      if (value === "inherit") {
        return [
          "ak-frame-border-(--border-width)",
          "ak-edge-alpha-(--border-weight,0.1) ak-edge-l-(--border-lightness,1)",
        ];
      }
      if (value === true) {
        value = 1;
      }
      return {
        style: { "--border-width": `${value}px` },
        class: "ak-frame-border-(--border-width)",
      };
    },
  },
  defaultVariants: {
    $frame: true,
  },
});
