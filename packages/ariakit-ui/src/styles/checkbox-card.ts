import { cv } from "clava";
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
    "[--checkbox-card-edge:var(--ak-edge)]",
    "not-ui-disabled:ui-checked-within:ak-edge-brand",
    "not-ui-disabled:ui-checked-within:ak-edge-raw",
    "ui-focus-visible-within:outline-2 outline-offset-2",
    "ui-checked-within:ak-layer-brand ui-checked-within:ak-layer-mix-20",
    "ui-checked-within:ak-layer-offset-0",
    "[&_input]:sr-only",
  ],
  defaultVariants: {
    $rounded: "xl",
    $p: 3,
    $border: true,
  },
});

export const checkboxCardGrid = cv({
  class: [
    "grid auto-rows-fr gap-3",
    "grid-cols-[repeat(auto-fill,minmax(var(--checkbox-card-min-w),1fr))]",
  ],
  variants: {
    $minItemSize(value?: string) {
      if (value == null) return;
      return {
        style: { "--checkbox-card-min-w": value },
      };
    },
  },
  defaultVariants: {
    $minItemSize: "10rem",
  },
});

export const checkboxCardCheck = cv({
  extend: [buttonSlot],
  class: [
    "*:hidden! [&>svg]:stroke-[2.5]",
    "group-ui-disabled/checkbox:ak-ink-0",
    "group-not-ui-disabled/checkbox:group-ui-checked-within/checkbox:ak-layer-color-(--checkbox-card-edge)",
    "group-not-ui-disabled/checkbox:group-ui-checked-within/checkbox:ring",
    "group-not-ui-disabled/checkbox:group-ui-checked-within/checkbox:ring-(--ak-layer)",
    "group-not-ui-disabled/checkbox:group-ui-checked-within/checkbox:border-0",
    "group-ui-checked-within/checkbox:*:block!",
  ],
  defaultVariants: {
    $darken: 6,
    $border: true,
    $borderType: "auto",
    $rounded: "full",
    $size: "lg",
  },
});

export const checkboxCardSlot = buttonSlot;

export const checkboxCardContent = buttonContent;

export const checkboxCardLabel = cv({
  extend: [buttonLabel],
  class: "grow",
});

export const checkboxCardDescription = buttonDescription;
