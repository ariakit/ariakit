import { cv } from "clava";
import { bevel } from "./bevel.ts";
import { controlGroup, controlSeparator } from "./control.ts";
import { frame } from "./frame.ts";

export const glider = cv({
  extend: [frame, bevel],
  class: "glider absolute! -z-1 pointer-events-none not-supports-anchor:hidden",
  variants: {
    $kind: {
      bevel: [
        "m-(--inset-padding)",
        "start-[anchor(start)] bottom-[anchor(bottom)]",
        "w-[calc(anchor-size()-var(--inset-padding)*2)]",
        "h-[calc(anchor-size()-var(--inset-padding)*2)]",
      ],
      flat: [
        "m-(--inset-padding)",
        "start-[anchor(start)] bottom-[anchor(bottom)]",
        "w-[calc(anchor-size()-var(--inset-padding)*2)]",
        "h-[calc(anchor-size()-var(--inset-padding)*2)]",
      ],
      bar: [
        "z-10",
        "not-[.vertical>&]:start-[calc(anchor(start)+var(--inset-padding))]",
        "not-[.vertical>&]:bottom-[anchor(--glider-group_bottom)]",
        "not-[.vertical>&]:w-[calc(anchor-size()-var(--inset-padding)*2)]",
        "not-[.vertical>&]:h-[calc(--spacing(0.5)+--spacing(0.1)*var(--contrast))]",
        // vertical orientation
        "[.vertical>&]:end-[anchor(--glider-group_end)]",
        "[.vertical>&]:bottom-[calc(anchor(bottom)+var(--inset-padding))]",
        "[.vertical>&]:w-[calc(--spacing(0.5)+--spacing(0.1)*var(--contrast))]",
        "[.vertical>&]:h-[calc(anchor-size()-var(--inset-padding)*2)]",
      ],
    },
    $state: {
      none: "",
      hover: [
        "[position-anchor:--glider-hover] ease-linear",
        "[.control:has(~&)]:ui-hover:[--glider-hover:--glider-hover]",
        "in-[.glider-group:hover:not(:has(:hover))]:delay-250",
        "in-[.glider-group:not(:hover)]:hidden",
        "supports-anchor:[.control:has(~&)]:ui-hover:bg-transparent",
        "supports-anchor:[.control:has(~&)]:ui-hover:border-transparent",
        "supports-anchor:[.control:has(~&)]:ui-hover:befter:hidden",
      ],
      focus: [
        "[position-anchor:--glider-focus]",
        "[.control:has(~&)]:ui-focus-visible:[--glider-focus:--glider-focus]",
        "not-peer-ui-focus-visible:outline-none",
        "supports-anchor:[.control:has(~&)]:ui-focus-visible:outline-none",
        "outline-2 outline-offset-1 outline-primary",
      ],
      selected: [
        "[position-anchor:--glider-selected] selected",
        "[.control:has(~&)]:ui-selected:[--glider-selected:--glider-selected]",
        "supports-anchor:[.control:has(~&)]:ui-selected:bg-transparent",
        "supports-anchor:[.control:has(~&)]:ui-selected:border-transparent",
        "supports-anchor:[.control:has(~&)]:ui-selected:befter:hidden",
      ],
    },
    $animated: [
      "transition-[inset-inline,border-color,height,width,outline]",
      "[.vertical>&]:transition-[inset-block,border-color,height,width,outline]",
      "duration-100 transition-discrete",
      "[.vertical>&]:duration-50",
    ],
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
      none: "unset",
      hover: "pop",
      focus: "ghost",
      selected:
        variants.$kind === "bar"
          ? "invert"
          : variants.$kind === "bevel"
            ? "light2"
            : "pop2",
    } satisfies Record<
      NonNullable<typeof variants.$state>,
      typeof variants.$bg
    >;
    setDefaultVariants({
      $bg: variants.$bg ?? bg[variants.$state ?? "none"],
    });
    if (variants.$state === "selected") {
      setDefaultVariants({
        $borderWeight: variants.$borderWeight ?? "adaptive",
      });
    }
    if (variants.$kind === "bar") {
      setDefaultVariants({ $rounded: false, $contrast: true, $border: false });
    }
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
    "separator -mx-[calc(var(--inset-padding,0px)*1.5+var(--border-width,0px)/2)]",
});

export const gliderGroup = cv({
  extend: [controlGroup],
  class: [
    "glider-group relative z-1",
    "[--glider-group-radius:var(--ak-frame-radius,0px)]",
    "not-[.vertical]:has-[>.glider]:[&>.control:not(:nth-last-child(1_of_.control)):not(:has(+.separator))]:-me-[calc(var(--inset-padding)*2)]",
    "[.vertical]:has-[>.glider]:[&>.control:not(:nth-last-child(1_of_.control))]:-mb-[calc(var(--inset-padding)*2)]",
    "supports-anchor:has-[>.glider]:[--inset-padding:calc(var(--ak-frame-padding,0px)+0px)]",
  ],
  style: {
    anchorName: "--glider-group",
    anchorScope:
      "--glider-group, --glider-hover, --glider-focus, --glider-selected",
  },
  computed: ({ variants }) => {
    const classes: string[] = [];
    if (variants.$gap !== "none") {
      classes.push(
        "supports-anchor:has-[>.glider]:p-0",
        // "supports-anchor:has-[>.glider]:[--inset-gap:var(--gap)]",
      );
    }
    if (variants.$p !== "none") {
      // classes.push(
      //   "supports-anchor:has-[>.glider]:[--inset-padding:calc(var(--ak-frame-padding,0px)+0px)]",
      // );
    }
    return classes;
  },
});
