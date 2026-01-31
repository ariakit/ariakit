import { cv } from "clava";
import { isBorderColor } from "./border.ts";
import { control, controlLabel, controlSlot } from "./control.ts";

export const badge = cv({
  extend: [control],
  class: "font-medium",
  defaultVariants: {
    $bg: "pop",
    $rounded: "full",
    $color: "tonal",
    $size: "xs",
    $p: "sm",
    $px: "lg",
    $gap: "lg",
    $mix: false,
    $border: "adaptive",
    $borderType: "inset",
  },
  computed: ({ variants, setDefaultVariants }) => {
    if (!variants.$bg) return;
    if (!isBorderColor(variants.$bg)) return;
    const $borderColor = variants.$borderColor ?? variants.$bg;
    setDefaultVariants({ $mix: 15, $borderColor });
  },
});

export const badgeLabel = controlLabel;

export const badgeSlot = controlSlot;
