import { cv } from "clava";
import { border } from "./border.ts";
import { button } from "./button.ts";

export const checkboxCard = cv({
  extend: [button, border],
  defaultVariants: {
    $variant: "layer",
    $frame: "card",
    $border: true,
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
    $minItemSize: "12rem",
  },
});
