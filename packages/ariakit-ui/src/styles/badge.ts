import { cv } from "clava";
import { isBorderColor } from "./border.ts";
import { control, controlIcon, controlLabel } from "./control.ts";

export const badge = cv({
  extend: [control],
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
  extend: [controlLabel],
  class: "ak-text-(--background-color)/70",
});

export const badgeIcon = cv({
  extend: [controlIcon],
  class: "ak-text-(--background-color)/70",
});
