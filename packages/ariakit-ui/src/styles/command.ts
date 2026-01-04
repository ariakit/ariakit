import { cv } from "../utils/cv.ts";

export const command = cv({
  class: [
    "not-[a]:cursor-default relative block",
    "[&:not(button)]:select-none",
    // Only apply cursor-pointer to submit buttons that are not disabled
    "[&:where([type='submit'],form_button:only-of-type,a_&)]:not-ak-disabled:cursor-pointer",
    // When active, scale x and y based on depth
    "ak-active:[--command-scale-x:min(100%,96%+4%*calc(1-clamp(0,var(--command-depth-x)/10,1)))]",
    "ak-active:[--command-scale-y:min(100%,94%+6%*calc(1-clamp(0,var(--command-depth-y)/10,1)))]",
    "ak-active:origin-bottom ak-active:scale-x-(--command-scale-x) ak-active:scale-y-(--command-scale-y)",
  ],
  variants: {
    depthX: {
      none: "[--command-depth-x:0]",
      xs: "[--command-depth-x:1]",
      sm: "[--command-depth-x:3]",
      md: "[--command-depth-x:5]",
      lg: "[--command-depth-x:7]",
      xl: "[--command-depth-x:10]",
    },
    depthY: {
      none: "[--command-depth-y:0]",
      xs: "[--command-depth-y:1]",
      sm: "[--command-depth-y:3]",
      md: "[--command-depth-y:5]",
      lg: "[--command-depth-y:7]",
      xl: "[--command-depth-y:10]",
    },
  },
  aliasVariants: {
    depth: ["depthX", "depthY"],
  },
  defaultVariants: {
    depth: "md",
  },
});
