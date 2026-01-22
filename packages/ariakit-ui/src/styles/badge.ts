import { cv } from "clava";
import { isBorderColor } from "./border.ts";
import { frame, frameAdornment, frameLabel } from "./frame.ts";

export const badge = cv({
  extend: [frame],
  class: "font-medium",
  defaultVariants: {
    $bg: "pop",
    $size: "xs",
    $radius: "badge",
    $border: "adaptive",
    $borderType: "inset",
    $px: "lg",
    $mix: 15,
  },
  computed: (context) => {
    if (!context.variants.$bg) return;
    if (!isBorderColor(context.variants.$bg)) return;
    context.setDefaultVariants({ $borderColor: context.variants.$bg });
  },
});

export const badgeText = cv({
  extend: [frameLabel],
  class: "ak-text-(--background-color)/70",
});

export const badgeIcon = cv({
  extend: [frameAdornment],
  class: "ak-text-(--background-color)/70",
});
