import { cv } from "clava";
import { border } from "./border.ts";

export const field = cv({
  extend: [border],
  class: [
    "group/field flex px-(--px) py-(--py)",
    "[--min-p:min(var(--px),var(--py))]",
    // "gap-[calc(min(var(--px),var(--py))-var(--icon-p))]",
  ],
  variants: {
    $gap: {
      none: "",
      sm: "[--gap:calc(var(--min-p)-var(--icon-p))] gap-(--gap)",
      md: "[--gap:var(--min-p)] gap-(--gap)",
    },
    $size: {
      xs: "text-xs [--icon-p:0.2em]",
      sm: "text-sm [--icon-p:0.2em]",
      md: "text-base [--icon-p:0.2em]",
      lg: "text-lg [--icon-p:0.3em]",
      xl: "text-xl [--icon-p:0.35em]",
    },
    $frame: {
      none: "",
      field: "ak-frame-field",
      card: "ak-frame-card",
      badge: "ak-frame-badge",
      round: "ak-frame-round",
    },
    $padding: {
      none: "",
      field: "ak-frame-p-field",
      card: "ak-frame-p-card",
      round: "ak-frame-p-round",
      badge: "ak-frame-p-badge",
    },
    $padding2: {
      none: "",
      // sm: "[--px:calc(var(--ak-frame-padding)*1.25)] [--py:calc(var(--ak-frame-padding)-(1lh-1em)/2)]",
      md: "[--px:calc(var(--ak-frame-padding)*1.25)] [--py:calc(var(--ak-frame-padding)-(1lh-1em)/2)]",
      lg: "[--px:calc(var(--ak-frame-padding)*1.75)] [--py:calc(var(--ak-frame-padding)-(1lh-1em)/2)]",
    },
    $square:
      "square [--px:0]! [--py:0]! size-[2.5em] items-center justify-center",
  },
  defaultVariants: {
    $gap: "sm",
    $size: "md",
    $frame: "field",
    $padding2: "md",
  },
  computed: (context) => {
    context.setDefaultVariants({ $padding: context.variants.$frame });
    if (context.variants.$frame === "round") {
      context.setDefaultVariants({ $padding2: "lg" });
    }
  },
});

export const fieldIcon = cv({
  class: [
    "flex-none flex items-center p-(--icon-p) size-[1lh] [&>svg]:block [&>svg]:size-full",
    "[--icon-mx:calc(min(var(--px),var(--py))-max(var(--px),var(--py)))]",
  ],
  variants: {
    $position: {
      auto: "first:ms-(--icon-mx) last:me-(--icon-mx)",
      start: "ms-(--icon-mx)",
      end: "me-(--icon-mx)",
    },
    $gap: {
      none: "",
      inherit: "",
    },
  },
  defaultVariants: {
    $position: "auto",
  },
});

export const fieldText = cv({
  class: "group-[.square]/field:sr-only",
  variants: {
    $truncate: "truncate",
    /** No gap between the text and the start icon. */
    $noStartGap: "-ms-(--gap)",
    /** No gap between the text and the end icon. */
    $noEndGap: "-me-(--gap)",
  },
});
