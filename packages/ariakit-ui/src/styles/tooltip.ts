import { cv } from "clava";
import { popover } from "./popover.ts";

export const tooltip = cv({
  extend: [popover],
  class: "px-2 text-sm",
  defaultVariants: {
    $shadow: "md",
    $rounded: "lg",
    $p: 1,
  },
});
