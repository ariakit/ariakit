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
      none: "[--frame-p:0px] ak-frame-p-(--frame-p)",
      px: "[--frame-p:var(--spacing-px)] ak-frame-p-(--frame-p)",
      xs: "[--frame-p:--spacing(0.5)] ak-frame-p-(--frame-p)",
      sm: "[--frame-p:--spacing(1)] ak-frame-p-(--frame-p)",
      md: "[--frame-p:--spacing(2)] ak-frame-p-(--frame-p)",
      lg: "[--frame-p:--spacing(3)] ak-frame-p-(--frame-p)",
      xl: "[--frame-p:--spacing(4)] ak-frame-p-(--frame-p)",
      "2xl": "[--frame-p:--spacing(6)] ak-frame-p-(--frame-p)",
      "3xl": "[--frame-p:--spacing(8)] ak-frame-p-(--frame-p)",
      "4xl": "[--frame-p:--spacing(10)] ak-frame-p-(--frame-p)",
    },
  },
  defaultVariants: {
    $roundedType: "auto",
  },
});
