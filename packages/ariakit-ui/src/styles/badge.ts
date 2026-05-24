import { cv } from "clava";
import { control, controlLabel, controlSlot } from "./control.ts";

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
    $rounded: "full",
    $size: "xs",
    $p: 1,
    $px: "lg",
    $gap: "lg",
    $border: true,
    $borderWeight: "adaptive",
    $borderType: "inset",
    $text: true,
    $textPush: 60,
    $textWarm: 20,
    $textChroma({ defaultValue, variants }) {
      if (typeof variants.$layer !== "string") return defaultValue;
      return defaultValue ?? "vivid";
    },
    $lightnessOffset({ defaultValue, variants }) {
      if (typeof variants.$layer === "string") return false;
      return defaultValue ?? true;
    },
    $mix({ defaultValue, variants }) {
      if (typeof variants.$layer !== "string") {
        return defaultValue;
      }
      return defaultValue ?? 15;
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
