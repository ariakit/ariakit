import type { StyleClassValue } from "clava";
import { cv } from "clava";
import type { Variant } from "../index.ts";
import { bevel } from "./bevel.ts";
import { controlGroup, controlSeparator } from "./control.ts";
import { frame } from "./frame.ts";

export const activeIndicator = cv({
  extend: [frame, bevel],
  class: [
    "fixed pointer-events-none transition-discrete duration-100 transition-all",
    "not-supports-anchor:hidden",
  ],
  variants: {
    $hover: [
      "in-[.ai-group:hover:not(:has(:hover))]:delay-150",
      "in-[.ai-group:not(:hover)]:delay-0",
      "in-[.ai-group:not(:hover)]:hidden",
    ],
    $kind: {
      bevel: "",
      flat: "",
      bar: "top-[calc(anchor(--aigrouplol_bottom)---spacing(0.5)---spacing(0.1)*var(--contrast))] start-[anchor(start)] end-[anchor(end)] bottom-[calc(anchor(--aigrouplol_bottom))] z-10 mx-[min(1lh,var(--radius))]",
    },
  },
  computedVariants: {
    $anchor: (value: string) => {
      return { positionAnchor: value } satisfies StyleClassValue;
    },
  },
  defaultVariants: {
    $kind: "flat",
    $rounded: "full",
    $bg: "pop",
    $p: "none",
    $borderType: "ring",
    // $contrast: true,
    // $kind: "bevel",
    // $border: "adaptive",
  },
  computed: ({ variants, setDefaultVariants }) => {
    const classes: string[] = [];
    if (!variants.$hover) {
      setDefaultVariants({ $border: variants.$border ?? "adaptive" });
    }
    if (variants.$kind === "flat" || variants.$kind === "bevel") {
      classes.push(
        "inset-[anchor(start)_anchor(end)_anchor(end)_anchor(start)] ak-frame-m-(--inset-gap)",
        variants.$bg === "invert" ? "z-1" : "-z-1!",
      );
      if (variants.$bg === "invert") {
        classes.push("ak-layer-white mix-blend-difference");
      }
    }
    if (variants.$kind === "bar") {
      setDefaultVariants({ $rounded: false, $contrast: true, $border: false });
    }
    if (variants.$kind === "bevel") {
      setDefaultVariants({ $contrast: true });
    }
    return classes;
  },
});

export const activeIndicatorItem = cv({
  class: "ai-item",
});

export const activeIndicatorSeparator = cv({
  extend: [controlSeparator],
  class: "separator",
});

export const activeIndicatorGroup = cv({
  extend: [controlGroup],
  class: [
    "ai-group z-1 relative [--radius:var(--ak-frame-radius)]",
    "[&>.control]:bg-transparent!",
    "[&>.control]:ui-hover:z-1",
    "[&>.control:not(:nth-last-child(1_of_.control)):not(:has(+.separator))]:-me-(--inset-gap)",
    // "[&>.separator]:ms-(--inset-gap)",
    "[&>.separator]:-mx-[calc(var(--inset-gap)/2)]",
  ],
  style: {
    anchorName: "--aigrouplol",
  },
  variants: {
    $size: {
      auto: "",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    $gap: {
      none: "",
      xs: "[--inset-gap:--spacing(0.5)]",
      sm: "[--inset-gap:--spacing(1)]",
      md: "[--inset-gap:--spacing(2)]",
      lg: "[--inset-gap:--spacing(3)]",
      xl: "[--inset-gap:--spacing(4)]",
      "2xl": "[--inset-gap:--spacing(6)]",
      "3xl": "[--inset-gap:--spacing(8)]",
      "4xl": "[--inset-gap:--spacing(10)]",
    } satisfies Variant<typeof frame, "$p">,
  },
  defaultVariants: {
    $bg: "pop",
    $size: "sm",
    $rounded: "full",
    $layout: "stretch",
    $p: "none",
    $gap: "sm",
  },
});
