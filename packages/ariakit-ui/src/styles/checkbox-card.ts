import { cv } from "clava";
import { border } from "./border.ts";
import { button, buttonIcon, buttonText } from "./button.ts";

export const checkboxCard = cv({
  extend: [button, border],
  class: ["not-ak-disabled:ak-checked-within:ak-edge-contrast-primary"],
  defaultVariants: {
    $color: "layer",
    $frame: "round",
    $padding: "card",
    $border: true,
    $gap: "md",
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
  extend: [buttonIcon, border],
  class: [
    "ak-layer-down ak-frame-force-full/1 ak-bordering",
    "size-6 flex-none self-start",
  ],
  defaultVariants: {
    $border: true,
    $borderType: "bordering",
  },
});

export const checkboxCardText = cv({
  extend: [buttonText],
  class: ["me-auto flex-1 self-start"],
  defaultVariants: {
    $truncate: true,
  },
});
