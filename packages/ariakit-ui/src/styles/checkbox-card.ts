import { cv } from "clava";
import { border } from "./border.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";

export const checkboxCard = cv({
  extend: [button],
  class: [
    "group/checkbox",
    "[--checkbox-card-edge:var(--ak-border)]",
    "not-ak-disabled:ak-checked-within:ak-edge-contrast-primary",
    "ak-focus-visible-within:outline-2 outline-offset-2",
    "ak-checked-within:ak-layer-mix-primary/20",
    "[&_input]:sr-only",
  ],
  defaultVariants: {
    $bg: "lighter",
    $radius: "card",
    $border: true,
  },
  computed: (context) => {
    if (context.variants.$radius === "round") {
      context.setDefaultVariants({ $padding: "card" });
    }
  },
});

export const checkboxCardGrid = cv({
  class: [
    "grid auto-rows-fr gap-3",
    "grid-cols-[repeat(auto-fill,minmax(var(--checkbox-card-min-w),1fr))]",
  ],
  computedVariants: {
    $minItemSize: (value: string) => ({
      "--checkbox-card-min-w": value,
    }),
  },
  defaultVariants: {
    $minItemSize: "10rem",
  },
});

export const checkboxCardCheck = cv({
  extend: [buttonSlot, border],
  class: [
    "*:hidden! [&>svg]:stroke-[2.5]",
    "group-ak-disabled/checkbox:ak-text/0",
    "group-not-ak-disabled/checkbox:group-ak-checked-within/checkbox:ak-layer-(--checkbox-card-edge)",
    "group-not-ak-disabled/checkbox:group-ak-checked-within/checkbox:ring",
    "group-not-ak-disabled/checkbox:group-ak-checked-within/checkbox:ring-(--ak-layer)",
    "group-not-ak-disabled/checkbox:group-ak-checked-within/checkbox:border-0",
    "group-ak-checked-within/checkbox:*:block!",
  ],
  variants: {
    $bg: {
      darker: "group-not-ak-disabled/checkbox:ak-layer-down",
      pop: "group-not-ak-disabled/checkbox:ak-layer-pop",
    },
    $radius: {
      round: "rounded-full",
    },
  },
  defaultVariants: {
    $bg: "darker",
    $border: true,
    $borderType: "bordering",
    $radius: "round",
    $size: "lg",
  },
});

export const checkboxCardIcon = buttonSlot;

export const checkboxCardContent = buttonContent;

export const checkboxCardLabel = buttonLabel;

export const checkboxCardDescription = buttonDescription;
