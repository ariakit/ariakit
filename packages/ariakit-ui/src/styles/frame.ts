import { cv } from "clava";
import { border } from "./border.ts";

export const frame = cv({
  extend: [border],
  variants: {
    /**
     * Sets the element’s border radius.
     */
    $rounded: {
      unset: "",
      false: "[--rounded:0px]",
      xs: "[--rounded:var(--radius-xs)]",
      sm: "[--rounded:var(--radius-sm)]",
      md: "[--rounded:var(--radius-md)]",
      lg: "[--rounded:var(--radius-lg)]",
      xl: "[--rounded:var(--radius-xl)]",
      "2xl": "[--rounded:var(--radius-2xl)]",
      "3xl": "[--rounded:var(--radius-3xl)]",
      "4xl": "[--rounded:var(--radius-4xl)]",
      full: "[--rounded:var(--radius-full)]",
    },
    /**
     * Forces the element's radius to be the same as the one set by the
     * `$rounded` variant.
     */
    $roundedType: {
      unset: "",
      auto: "ak-frame-rounded-(--rounded)",
      force: "ak-frame-rounded-force-(--rounded)",
      cover: "ak-frame-cover-(--rounded)",
      overflow: "ak-frame-overflow-(--rounded)",
    },
    /**
     * Sets the element’s padding.
     */
    $p: {
      unset: "",
      none: "ak-frame-p-0",
      px: "ak-frame-p-px",
      xs: "ak-frame-p-0.5",
      sm: "ak-frame-p-1",
      md: "ak-frame-p-2",
      lg: "ak-frame-p-3",
      xl: "ak-frame-p-4",
      "2xl": "ak-frame-p-6",
      "3xl": "ak-frame-p-8",
      "4xl": "ak-frame-p-10",
    },
  },
  defaultVariants: {
    $roundedType: "auto",
  },
});
