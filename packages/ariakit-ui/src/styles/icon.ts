import { cv } from "../utils/cv.ts";

export const icon = cv({
  class: "flex-none block h-lh [&>svg]:block [&>svg]:h-full",
  variants: {
    position: {
      start:
        "ms-[calc(var(--ak-frame-padding,0px)-var(--px,var(--ak-frame-padding,0px)))]",
      end: "me-[calc(var(--ak-frame-padding,0px)-var(--px,var(--ak-frame-padding,0px)))]",
    },
  },
});
