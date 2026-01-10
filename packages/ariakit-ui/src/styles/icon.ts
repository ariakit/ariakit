import { cv } from "clava";

export const icon = cv({
  class: "flex-none flex items-center h-lh [&>svg]:block [&>svg]:h-full",
  variants: {
    $position: {
      start:
        "ms-[calc(var(--ak-frame-padding,0)-var(--px,var(--ak-frame-padding,0)))]",
      end: "me-[calc(var(--ak-frame-padding,0)-var(--px,var(--ak-frame-padding,0)))]",
    },
  },
});
