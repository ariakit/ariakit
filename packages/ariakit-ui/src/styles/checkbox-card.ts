import { cv } from "clava";
import { border } from "./border.ts";
import { button, buttonIcon, buttonText } from "./button.ts";

export const checkboxCard = cv({
  extend: [button, border],
  class: [
    "group/checkbox",
    "[--checkbox-card-edge:var(--ak-border)]",
    "not-ak-disabled:ak-checked-within:ak-edge-contrast-primary",
    "ak-focus-visible-within:outline-2 outline-offset-2",
    "ak-checked-within:ak-layer-mix-primary/20",
    "[&_input]:sr-only",
  ],
  defaultVariants: {
    $color: "lighter",
    $frame: "card",
    $border: true,
    $gap: "md",
    // $size: "sm",
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

export const checkboxCardIcon = cv({
  extend: [buttonIcon],
});

export const checkboxCardCheck = cv({
  extend: [buttonIcon, border],
  // stroke-width increase
  class: [
    "flex items-center justify-center *:hidden! [&>svg]:stroke-[2.5]",
    "group-ak-disabled/checkbox:ak-text/0",
    "group-not-ak-disabled/checkbox:group-ak-checked-within/checkbox:ak-layer-(--checkbox-card-edge)",
    "group-not-ak-disabled/checkbox:group-ak-checked-within/checkbox:ring",
    "group-not-ak-disabled/checkbox:group-ak-checked-within/checkbox:ring-(--ak-layer)",
    "group-not-ak-disabled/checkbox:group-ak-checked-within/checkbox:border-0",
    "group-ak-checked-within/checkbox:*:block!",
  ],
  variants: {
    $color: {
      darker: "group-not-ak-disabled/checkbox:ak-layer-down",
      pop: "group-not-ak-disabled/checkbox:ak-layer-pop",
    },
    $frame: {
      auto: "ak-frame-full/1",
      round: "ak-frame-force-full/1",
    },
  },
  defaultVariants: {
    $color: "darker",
    $border: true,
    $borderType: "bordering",
    // $padding: "none",
    $frame: "round",
    // $size: "sm",
  },
});

export const checkboxCardContent = cv({
  class: "flex flex-1 flex-wrap content-start self-start",
});

export const checkboxCardLabel = cv({
  extend: [buttonText],
  class: ["me-auto self-start"],
});

export const checkboxCardDescription = cv({
  extend: [buttonText],
  class: "w-full ak-text/70 font-normal group-ak-disabled/checkbox:ak-text/0",
  defaultVariants: {
    $truncate: false,
  },
});
