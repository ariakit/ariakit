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
      false: "[--frame-radius:0px]",
      xs: "[--frame-radius:theme(--radius-xs)]",
      sm: "[--frame-radius:theme(--radius-sm)]",
      md: "[--frame-radius:theme(--radius-md)]",
      lg: "[--frame-radius:theme(--radius-lg)]",
      xl: "[--frame-radius:theme(--radius-xl)]",
      "2xl": "[--frame-radius:theme(--radius-2xl)]",
      "3xl": "[--frame-radius:theme(--radius-3xl)]",
      "4xl": "[--frame-radius:theme(--radius-4xl)]",
      full: "[--frame-radius:theme(--radius-full)]",
    },
    /**
     * Forces the element's radius to be the same as the one set by the
     * `$rounded` variant.
     */
    $roundedType: {
      unset: "",
      auto: "ak-frame-rounded-(--frame-radius)",
      force: "ak-frame-rounded-force-(--frame-radius)",
      cover: "ak-frame-cover-(--frame-radius)",
      overflow: "ak-frame-overflow-(--frame-radius)",
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
