import { cv } from "clava";
import { control, controlLabel, controlSlot } from "./control.ts";

function isColorLayer(value: unknown) {
  return (
    value === "brand" ||
    value === "success" ||
    value === "warning" ||
    value === "danger"
  );
}

function isFrameBorderColor(
  value: unknown,
): value is "brand" | "success" | "warning" | "danger" {
  return (
    value === "brand" ||
    value === "success" ||
    value === "warning" ||
    value === "danger"
  );
}

export const badge = cv({
  extend: [control],
  class: "font-medium",
  defaultVariants: {
    $lightnessOffset: true,
    $rounded: "full",
    $size: "xs",
    $p: 1,
    $px: "lg",
    $gap: "lg",
    $border: true,
    $borderWeight: "adaptive",
    $borderType: "inset",
    $mix: (ctx) => {
      if (typeof ctx.variants.$layer !== "string") {
        return ctx.defaultValue ?? false;
      }
      return isColorLayer(ctx.variants.$layer)
        ? 15
        : (ctx.defaultValue ?? false);
    },
    $borderColor: (ctx) => {
      if (typeof ctx.variants.$layer !== "string") return ctx.defaultValue;
      if (!isFrameBorderColor(ctx.variants.$layer)) return ctx.defaultValue;
      return ctx.defaultValue ?? ctx.variants.$layer;
    },
  },
});

export const badgeLabel = controlLabel;

export const badgeSlot = controlSlot;
