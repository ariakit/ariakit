import { cv } from "clava";

export const text = cv({
  variants: {
    /**
     * Sets the element's text color. Use `auto` to inherit the parent’s text
     * color.
     */
    $color: {
      auto: "",
      tonal: "ak-ink-(--text-opacity) *:ak-ink-(--text-opacity)",
      primary: "ak-text ak-text-primary *:ak-text *:ak-text-primary",
      secondary: "ak-text ak-text-secondary *:ak-text *:ak-text-secondary",
      success: "ak-text ak-text-success *:ak-text *:ak-text-success",
      warning: "ak-text ak-text-warning *:ak-text *:ak-text-warning",
      danger: "ak-text ak-text-danger *:ak-text *:ak-text-danger",
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
    $textOpacity: "unset",
  },
});
