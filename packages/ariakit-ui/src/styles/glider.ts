import { cv } from "clava";
import { bevel } from "./bevel.ts";
import { controlGroup, controlSeparator } from "./control.ts";
import { frame } from "./frame.ts";

export const glider = cv({
  extend: [frame, bevel],
  class: "absolute -z-1 pointer-events-none not-supports-anchor:hidden",
  variants: {
    $kind: {
      bevel: [
        "m-(--inset-padding)",
        "start-[anchor(start)] top-[anchor(top)] w-[calc(anchor-size()-var(--inset-padding)*2)] h-[calc(anchor-size()-var(--inset-padding)*2)]",
      ],
      flat: [
        "m-(--inset-padding)",
        "start-[anchor(start)] top-[anchor(top)] w-[calc(anchor-size()-var(--inset-padding)*2)] h-[calc(anchor-size()-var(--inset-padding)*2)]",
      ],
      bar: [
        "z-10",
        "not-[.vertical>&]:start-[calc(anchor(start)+var(--inset-padding))]",
        "not-[.vertical>&]:bottom-[anchor(--glider-group_bottom)]",
        "not-[.vertical>&]:w-[calc(anchor-size()-var(--inset-padding)*2)]",
        "not-[.vertical>&]:h-[calc(--spacing(0.5)+--spacing(0.1)*var(--contrast))]",
        // vertical orientation
        "[.vertical>&]:end-[anchor(--glider-group_end)]",
        "[.vertical>&]:top-[calc(anchor(top)+var(--inset-padding))]",
        "[.vertical>&]:w-[calc(--spacing(0.5)+--spacing(0.1)*var(--contrast))]",
        "[.vertical>&]:h-[calc(anchor-size()-var(--inset-padding)*2)]",
      ],
    },
    $state: {
      none: "",
      hover: [
        "[position-anchor:--glider-hover] ease-linear",
        "[.control:has(~&)]:ui-hover:[--glider-hover:--glider-hover]",
        "in-[.ai-group:hover:not(:has(:hover))]:delay-250",
        "in-[.ai-group:not(:hover)]:hidden",
        "supports-anchor:[.control:has(~&)]:ui-hover:bg-transparent",
      ],
      focus: [
        "[position-anchor:--glider-focus]",
        "[.control:has(~&)]:ui-focus-visible:[--glider-focus:--glider-focus]",
        "not-peer-ui-focus-visible:outline-none",
        "supports-anchor:[.control:has(~&)]:ui-focus-visible:outline-none",
        "outline-2 outline-offset-1 outline-primary",
      ],
      selected: [
        "[position-anchor:--glider-selected]",
        "[.control:has(~&)]:ui-selected:[--glider-selected:--glider-selected]",
        "supports-anchor:[.control:has(~&)]:ui-selected:bg-transparent",
      ],
    },
    $animated:
      "transition-[inset-inline,border-color,height,width,outline] [.vertical>&]:transition-[inset-block,border-color,height,width,outline] duration-100 transition-discrete",
  },
  defaultVariants: {
    $kind: "flat",
    $state: "selected",
    $animated: true,
    $rounded: "full",
    $p: "none",
    $borderType: "ring",
  },
  computed: ({ variants, setDefaultVariants }) => {
    const bg = {
      none: "none",
      hover: "pop",
      focus: "ghost",
      selected: variants.$kind === "bar" ? "invert" : "pop2",
    } satisfies Record<
      NonNullable<typeof variants.$state>,
      typeof variants.$bg
    >;
    setDefaultVariants({
      $bg: variants.$bg ?? bg[variants.$state ?? "none"],
    });
    if (variants.$state === "selected") {
      setDefaultVariants({ $border: variants.$border ?? "adaptive" });
    }
    if (variants.$kind === "bar") {
      setDefaultVariants({ $rounded: false, $contrast: true, $border: false });
    }
    // if (variants.$kind === "bevel") {
    //   setDefaultVariants({ $contrast: true });
    // }
  },
});

export const gliderAnchor = cv({
  class: "peer",
  style: {
    anchorName:
      "var(--glider-hover,--x), var(--glider-focus,--x), var(--glider-selected,--x)",
  },
});

export const gliderSeparator = cv({
  extend: [controlSeparator],
  class:
    "separator supports-anchor:-mx-[calc(var(--inset-padding)*1.5+var(--border-width)/2)]",
});

export const gliderGroup = cv({
  extend: [controlGroup],
  class: [
    "ai-group z-1 [anchor-scope:--glider-group,--glider-hover,--glider-focus,--glider-selected]",
    "[--glider-group-radius:var(--ak-frame-radius)]",
    "not-[.vertical]:[&>.control:not(:nth-last-child(1_of_.control)):not(:has(+.separator))]:-me-[calc(var(--inset-padding)*2)]",
    "[.vertical]:[&>.control:not(:nth-last-child(1_of_.control))]:-mb-[calc(var(--inset-padding)*2)]",
  ],
  style: {
    anchorName: "--glider-group",
  },
  defaultVariants: {
    // $bg: "pop",
    // $border: false,
    $size: "md",
    $rounded: "xl",
    $layout: "vertical",
    $p: "md",
    $gap: "auto",
  },
  computed: ({ variants }) => {
    const classes: string[] = [];
    if (variants.$gap !== "none") {
      classes.push(
        "supports-anchor:p-0 supports-anchor:[--inset-gap:var(--gap)]",
      );
    }
    if (variants.$p !== "none") {
      classes.push("supports-anchor:[--inset-padding:var(--ak-frame-padding)]");
    }
    return classes;
  },
});
