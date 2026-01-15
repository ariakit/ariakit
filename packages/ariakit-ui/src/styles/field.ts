import { cv } from "clava";
import { border } from "./border.ts";

export const field = cv({
  extend: [border],
  class: "group/field flex px-(--px) py-(--py)",
  variants: {
    $gap: {
      none: "",
      sm: "[--gap:calc(min(var(--px),var(--py))-var(--icon-p))] gap-(--gap)",
      md: "[--gap:min(var(--px),var(--py))] gap-(--gap)",
      lg: "[--gap:calc(min(var(--px),var(--py))+var(--icon-p))] gap-(--gap)",
    },
    $size: {
      xs: "text-xs [--icon-p:0.15em]",
      sm: "text-sm [--icon-p:0.2em]",
      md: "text-base [--icon-p:0.25em]",
      lg: "text-lg [--icon-p:0.3em]",
      xl: "text-xl [--icon-p:0.35em]",
    },
    $frame: {
      none: "",
      field: "ak-frame-rounded-field",
      card: "ak-frame-rounded-card",
      badge: "ak-frame-rounded-badge",
      round: "ak-frame-rounded-full",
    },
    $padding: {
      none: "",
      field: "ak-frame-p-field",
      card: "ak-frame-p-field-card",
      round: "ak-frame-p-field",
      badge: "ak-frame-p-badge",
    },
    $square: {
      true: "square [--px:0] [--py:0] size-[2.5em] items-center justify-center",
      false: [
        "[--px:calc(var(--ak-frame-padding,0px)*2)]",
        "[--py:var(--ak-frame-padding,0px)]",
      ],
    },
  },
  defaultVariants: {
    $gap: "sm",
    $size: "md",
    $frame: "field",
  },
  computed: (context) => {
    context.setDefaultVariants({ $padding: context.variants.$frame });
  },
});

export const fieldIcon = cv({
  class: [
    "flex flex-none items-center [&>svg]:block [&>svg]:size-full",
    "[--min-p:min(var(--px),var(--py))] [--max-p:max(var(--px),var(--py))]",
    "[--icon-mx:calc(var(--min-p)-var(--max-p))]",
  ],
  variants: {
    $position: {
      auto: "first:ms-(--icon-mx) last:me-(--icon-mx)",
      start: "ms-(--icon-mx)",
      end: "me-(--icon-mx)",
    },
    $padding: {
      none: "",
      xs: "[--lh-cut:0.3] p-[--spacing(calc(1/var(--lh-cut)/10))]",
      sm: "[--lh-cut:0.2] p-[--spacing(calc(1/var(--lh-cut)/10))]",
      md: "p-(--icon-p)",
    },
    $size: {
      none: "",
      xs: "[--lh:calc(var(--lh-cut,1)*1lh)] size-[calc(1lh-var(--lh))] mt-[calc(var(--lh)/2)] [--icon-mx:calc(var(--min-p)-var(--max-p)+var(--lh)/2)]",
      sm: "[--lh:calc(var(--lh-cut,1)*1lh)] size-[calc(1lh-var(--lh))] mt-[calc(var(--lh)/2)] [--icon-mx:calc(var(--min-p)-var(--max-p)+var(--lh)/2)]",
      md: "size-[1lh]",
    },
  },
  defaultVariants: {
    $position: "auto",
    $size: "md",
  },
  computed: (context) => {
    context.setDefaultVariants({ $padding: context.variants.$size });
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
