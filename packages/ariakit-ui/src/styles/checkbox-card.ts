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
    "[--checkbox-card-edge:var(--ak-border)]",
    "not-ui-disabled:ui-checked-within:ak-edge-contrast-primary",
    "ui-focus-visible-within:outline-2 outline-offset-2",
    "ui-checked-within:ak-layer-mix-primary/20",
    "[&_input]:sr-only",
  ],
  defaultVariants: {
    $bg: "light",
    $rounded: "xl",
    $p: "lg",
    $border: true,
  },
  computed: (context) => {
    if (context.variants.$rounded === "full") {
      context.setDefaultVariants({ $p: "lg" });
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
  extend: [buttonSlot],
  class: [
    "*:hidden! [&>svg]:stroke-[2.5]",
    "group-ui-disabled/checkbox:ak-text/0",
    "group-not-ui-disabled/checkbox:group-ui-checked-within/checkbox:ak-layer-(--checkbox-card-edge)",
    "group-not-ui-disabled/checkbox:group-ui-checked-within/checkbox:ring",
    "group-not-ui-disabled/checkbox:group-ui-checked-within/checkbox:ring-(--ak-layer)",
    "group-not-ui-disabled/checkbox:group-ui-checked-within/checkbox:border-0",
    "group-ui-checked-within/checkbox:*:block!",
  ],
  variants: {
    $bg: {
      dark: "group-not-ui-disabled/checkbox:ak-layer-down",
      pop: "group-not-ui-disabled/checkbox:ak-layer-pop",
    },
  },
  defaultVariants: {
    $bg: "dark",
    $border: true,
    $borderType: "bordering",
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
