import { cv } from "clava";
import { isBorderColor } from "./border.ts";
import { control, controlLabel, controlSlot } from "./control.ts";

export const badge = cv({
  extend: [control],
  class: "font-medium",
  defaultVariants: {
    $layer: "pop",
    $rounded: "full",
    $color: "tonal",
    $size: "xs",
    $p: "sm",
    $px: "lg",
    $gap: "lg",
    $mix: false,
    $border: true,
    $borderWeight: "adaptive",
    $borderType: "inset",
    $textOpacity: 70,
  },
  refine: ({ variants, setDefaultVariants }) => {
    if (!variants.$layer) return;
    if (!isBorderColor(variants.$layer)) return;
    // If the background is set to a color that’s also available for the border,
    // we use it for the border and blend the background with the parent layer.
    const $borderColor = variants.$borderColor ?? variants.$layer;
    setDefaultVariants({ $mix: 15, $borderColor });
  },
});

export const badgeLabel = controlLabel;

export const badgeSlot = controlSlot;
