import { cv } from "clava";
import { isBorderColor } from "./border.ts";
import { frame, frameLabel, frameSlot } from "./frame.ts";

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
    $mix: false,
  },
  computed: (context) => {
    if (!context.variants.$bg) return;
    if (!isBorderColor(context.variants.$bg)) return;
    context.setDefaultVariants({
      $mix: 15,
      $borderColor: context.variants.$bg,
    });
  },
});

export const badgeLabel = cv({
  extend: [frameLabel],
  class: "ak-text-(--background-color)/70",
});

export const badgeSlot = cv({
  extend: [frameSlot],
  class: "ak-text-(--background-color)/70",
});
