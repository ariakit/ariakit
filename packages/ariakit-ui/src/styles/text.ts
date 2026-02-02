import { cv } from "clava";

export const text = cv({
  variants: {
    /**
     * Sets the element's text color.
     */
    $color: {
      auto: "",
      tonal:
        "ak-text-(--ak-layer-idle)/(--text-opacity) *:ak-text-(--ak-layer-idle)/(--text-opacity)",
      primary:
        "ak-text-primary/(--text-opacity) *:ak-text-primary/(--text-opacity)",
      secondary:
        "ak-text-secondary/(--text-opacity) *:ak-text-secondary/(--text-opacity)",
      success:
        "ak-text-success/(--text-opacity) *:ak-text-success/(--text-opacity)",
      warning:
        "ak-text-warning/(--text-opacity) *:ak-text-warning/(--text-opacity)",
      danger:
        "ak-text-danger/(--text-opacity) *:ak-text-danger/(--text-opacity)",
    },
    /**
     * Sets the element's text opacity.
     */
    $textOpacity: {
      unset: "",
      50: "[--text-opacity:50]",
      60: "[--text-opacity:60]",
      70: "[--text-opacity:70]",
      80: "[--text-opacity:80]",
      90: "[--text-opacity:90]",
      100: "[--text-opacity:100]",
    },
  },
  defaultVariants: {
    $color: "auto",
    $textOpacity: 100,
  },
});
