import { cv } from "clava";
import { background } from "./background.ts";
import { border, isBorderColor } from "./border.ts";
import { frame } from "./frame.ts";

export const control = cv({
  extend: [background, frame],
  class: [
    "control group/control flex justify-center",
    "[--parent-background:var(--ak-layer-parent)]",
    // font sidebearing
    "[--sb:0.15em]",
  ],
  variants: {
    /**
     * Sets the element’s font size. This affects the entire element, including
     * the gap, padding, and icon size. Use `auto` to inherit the parent’s font
     * size.
     */
    $size: {
      auto: "",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    /**
     * Sets the element's text color.
     */
    $color: {
      default: "",
      tonal: "*:ak-text-(--ak-layer-idle)/60",
      primary: "*:ak-text-primary/60",
      secondary: "*:ak-text-secondary/60",
      success: "*:ak-text-success/60",
      warning: "*:ak-text-warning/60",
      danger: "*:ak-text-danger/60",
    },
    /**
     * Sets the gap between the element's content and its siblings.
     */
    $gap: {
      none: "",
      sm: "[--gap:var(--py)] gap-(--gap)",
      md: "[--gap:calc(var(--px)-var(--sb))] gap-(--gap)",
      lg: "[--gap:calc(var(--px))] gap-(--gap)",
      xl: "[--gap:calc(var(--px)+var(--sb))] gap-(--gap)",
    },
    /**
     * Sets the vertical gap between the element's label and description.
     */
    $gapY: {
      none: "",
      auto: "[--gap-y:calc(var(--gap)/4)] gap-y-(--gap-y)",
    },
    /**
     * Sets the element’s horizontal padding. Rounded elements often look best
     * with more padding.
     */
    $px: {
      none: "",
      sm: "[--px-scale:0]",
      md: "[--px-scale:0.5]",
      lg: "[--px-scale:0.75]",
      xl: "[--px-scale:1.25]",
    },
    /**
     * Sets the element’s disabled state.
     */
    $disabled:
      "disabled ak-layer-pop-0.5 cursor-not-allowed! ak-text/0! *:ak-text/0! border-transparent! ring-transparent! inset-shadow-none! bg-none! shadow-none!",
  },
  defaultVariants: {
    $size: "auto",
    $color: "default",
    $rounded: "md",
    $p: "md",
    $gap: "md",
    $gapY: "auto",
    $px: "md",
  },
  computed: ({ variants, setDefaultVariants }) => {
    if (variants.$disabled) {
      setDefaultVariants({ $bg: "disabled" });
    }
    if (variants.$p === "none") {
      return setDefaultVariants({ $px: "none" });
    }
    return [
      "[--px:calc(var(--ak-frame-padding,0px)+(1lh-1cap)*var(--px-scale))]",
      "[--py:calc(var(--ak-frame-padding,0px))]",
      "px-[calc(var(--px)+var(--inset-padding,0px))]",
      "py-[calc(var(--py)+var(--inset-padding,0px))]",
    ];
  },
});

export const controlSlot = cv({
  extend: [background, border],
  class: [
    "flex flex-none items-center justify-center",
    "[--mx:calc((var(--py)-var(--px))*var(--size-scale,1)+var(--half-line-gap)*var(--row-span))]",
    "[--my:calc(var(--half-line-gap)*var(--row-span))]",
    "[--half-line-gap:calc((1lh-var(--size,1lh))/2)]",
    "min-w-(--size) h-[calc(var(--size)*var(--row-span))]",
    "[&>svg]:block [&>svg]:size-(--size) mx-(--mx) my-(--my)",
    // debug
    // "relative after:absolute after:-inset-[calc(var(--half-line-gap)+var(--py))] after:bg-yellow-500/40",
  ],
  variants: {
    $bg: {
      // When the frame's bg is inverted, we need to make the pop effect more
      // pronounced so it's still visible.
      pop: "group-[.background-invert]/control:ak-layer-pop-2.5",
    },
    $size: {
      none: "",
      xs: "[--size:1ex]",
      sm: "[--size:1cap]",
      md: "[--size:1em]",
      lg: "[--size:0.875lh]",
      xl: "[--size:1lh]",
      "2xl": "[--size:calc(1lh+var(--py)/var(--row-span))]",
      full: "[--size:calc(1lh+var(--py)*2/var(--row-span))]",
    },
    /**
     * Sets the element's text color. TODO: Abstract this to a separate utility.
     */
    $color: {
      default: "",
      tonal: "*:ak-text-(--ak-layer-idle)/60",
      primary: "*:ak-text-primary/60",
      secondary: "*:ak-text-secondary/60",
      success: "*:ak-text-success/60",
      warning: "*:ak-text-warning/60",
      danger: "*:ak-text-danger/60",
    },
    $mx: {
      none: "",
      xs: "[&+*]:-ms-(--sb) [*:has(+&)]:-me-(--sb)",
      sm: "[&+*]:-ms-(--sb) [*:has(+&)]:-me-(--sb)",
      md: "",
      lg: "",
      xl: "[&+*]:ms-(--sb) [*:has(+&)]:me-(--sb)",
      "2xl": "[&+*]:ms-(--py) [*:has(+&)]:me-(--py)",
      full: " [&+*]:ms-[1cap] [*:has(+&)]:me-[1cap]",
    },
    $px: {
      none: "",
      xs: "px-[calc(var(--size)*0.05+0.4em*(1-var(--size-scale,1)))]",
      sm: "px-[calc(var(--size)*0.1+0.4em*(1-var(--size-scale,1)))]",
      md: "px-[calc(var(--size)*0.15+0.4em*(1-var(--size-scale,1)))]",
      lg: "px-[calc(var(--size)*0.15+0.4em*(1-var(--size-scale,1)))]",
      xl: "px-[calc(var(--size)*0.2+0.4em*(1-var(--size-scale,1)))]",
      "2xl": "px-[calc(var(--size)*0.25+0.4em*(1-var(--size-scale,1)))]",
      full: "px-[calc(var(--size)*0.25+0.4em*(1-var(--size-scale,1)))]",
    },
    $rounded: {
      none: "",
      auto: "rounded-[max(var(--radius)/2,var(--ak-frame-radius)-var(--ak-frame-border)-var(--py)-var(--half-line-gap)*var(--row-span))]",
      round: "rounded-full",
    },
    $closeGap: "[&+*]:-ms-1 [*:has(+&)]:-me-1",
    $square: "aspect-square",
    $kind: {
      icon: "",
      avatar: "overflow-clip",
      shortcut: "",
      badge:
        "[--size-scale:0.8125] text-[calc(1em*var(--size-scale))] leading-[1lh]",
    },
    $floating:
      "m-0! absolute top-0 end-0 -translate-y-1/2 translate-x-[calc(var(--size)/2)] border border-(--parent-background)",
  },
  computedVariants: {
    $rowSpan: (value: number) => ({ "--row-span": `${value}` }),
  },
  defaultVariants: {
    $kind: "icon",
    $bg: "none",
    $size: "md",
    $rounded: "auto",
    $rowSpan: 1,
    $px: "none",
  },
  computed: ({ variants, setVariants, setDefaultVariants }) => {
    setDefaultVariants({
      $mx: variants.$size,
      $square: variants.$kind === "icon" || variants.$kind === "avatar",
    });
    const classes: string[] = [];
    if (variants.$closeGap) {
      return setVariants({ $mx: "none" });
    }
    const mdOrLess = [undefined, "none", "xs", "sm", "md"];
    if (variants.$bg !== "none") {
      const $size = mdOrLess.includes(variants.$size) ? "lg" : variants.$size;
      setVariants({ $size });
      setDefaultVariants({ $mx: $size, $px: $size });
      // Disabled frame
      classes.push(
        "group-[.disabled]/control:ak-layer-down group-[.disabled]/control:ak-text/0",
      );
    }
    if (variants.$kind === "badge") {
      const lgOrLess = [...mdOrLess, "lg"];
      const $size = lgOrLess.includes(variants.$size) ? "xl" : variants.$size;
      const $bg = variants.$bg === "none" ? "primary" : variants.$bg;
      if (isBorderColor($bg)) {
        setDefaultVariants({ $borderColor: $bg });
      }
      setVariants({ $size, $bg });
      setDefaultVariants({
        $px: $size,
        $mx: $size,
        $contrast: true,
        $color: "tonal",
      });
    }
    if (variants.$kind === "avatar") {
      const lgOrLess = [...mdOrLess, "lg"];
      const $size = lgOrLess.includes(variants.$size) ? "xl" : variants.$size;
      const $bg = variants.$bg === "none" ? "pop" : variants.$bg;
      setVariants({ $size, $bg });
      setDefaultVariants({ $mx: $size, $rounded: "round" });
    }
    if (variants.$floating) {
      setDefaultVariants({ $rounded: "round" });
    }
    return classes;
  },
});

export const controlContent = cv({
  class:
    "group/control-content flex flex-1 min-w-0 content-start text-start gap-x-(--gap) gap-y-(--gap-y)",
  variants: {
    $orientation: {
      horizontal: "flex-wrap",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    $orientation: "vertical",
  },
});

export const controlLabel = cv({
  class:
    "group-[.flex-col]/control-content:flex-none group-[.disabled]/control:ak-text/0",
  variants: {
    $truncate: "truncate",
  },
});

export const controlDescription = cv({
  class:
    "ms-0! ak-text/70 basis-full font-normal text-[0.875em] group-[.disabled]/control:ak-text/0",
  variants: {
    $truncate: "truncate",
  },
  computedVariants: {
    $lineClamp: (value: number | false) => {
      if (value === false) return;
      return { "--line-clamp": `${value}`, class: "line-clamp-(--line-clamp)" };
    },
  },
});

export const controlSeparator = cv({
  class: [
    "[.vertical>&]:hidden",
    "ak-layer-0 bg-transparent flex items-center justify-center pointer-events-none",
    "transition-[border-color] duration-200 ease-out",
    "[--border-width:calc(var(--width)*1px)]",
    "h-(--size) border-e-(length:--border-width) -mx-[calc((var(--ak-frame-padding)+var(--border-width))/2)]",
  ],
  variants: {
    $kind: {
      pipe: "rounded-full",
      slash: "rounded-full -skew-15",
      chevron: [
        "chevron rounded-se-xs [--border-width:calc(var(--width)*2px)]! border-t-(length:--border-width)",
        "aspect-square scale-50 rotate-45 -translate-x-1/10",
      ],
    },
    $size: {
      xs: "[--size:1cap] self-center ak-edge/[calc(24-var(--width)*6)] [.chevron]:ak-edge/[calc(64-var(--width)*12)]",
      sm: "[--size:1em] self-center ak-edge/[calc(24-var(--width)*6)] [.chevron]:ak-edge/[calc(64-var(--width)*12)]",
      md: "[--size:1lh] self-center ak-edge/[calc(24-var(--width)*6)] [.chevron]:ak-edge/[calc(64-var(--width)*12)]",
      lg: "self-stretch ak-edge",
      full: "self-stretch ak-edge -my-(--ak-frame-padding) mx-0",
    },
    $shy: [
      "in-[.control-group:hover:not(:has(:hover))]:delay-150",
      "ui-adjacent-hover:border-transparent",
      "ui-adjacent-selected:border-transparent",
      "ui-adjacent-focus-visible:border-transparent",
    ],
    $width: {
      1: "[--width:1]",
      2: "[--width:2]",
      3: "[--width:3]",
    },
  },
  defaultVariants: {
    $size: "md",
    $width: 1,
    $kind: "pipe",
  },
  computed: ({ variants, setVariants, setDefaultVariants }) => {
    if (
      variants.$kind === "chevron" &&
      (variants.$size === "lg" || variants.$size === "full")
    ) {
      setVariants({ $size: "md" });
    }
    if (variants.$kind !== "chevron" && variants.$size !== "full") {
      setDefaultVariants({ $shy: variants.$shy ?? true });
    }
  },
});

export const controlGroup = cv({
  extend: [background, frame],
  class: ["control-group"],
  variants: {
    $size: {
      auto: "",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    $layout: {
      none: "",
      wrap: "flex flex-wrap",
      stretch:
        "flex w-full [&>.control]:basis-0 [&>.control]:min-w-0 [&>.control]:grow",
      horizontal: "flex",
      vertical: "vertical flex flex-col [&>.control]:justify-start",
    },
    $gap: {
      none: "",
      auto: "[--gap:var(--ak-frame-padding)] gap-(--gap)",
      xs: "[--gap:--spacing(0.5)] gap-(--gap)",
      sm: "[--gap:--spacing(1)] gap-(--gap)",
      md: "[--gap:--spacing(2)] gap-(--gap)",
      lg: "[--gap:--spacing(3)] gap-(--gap)",
      xl: "[--gap:--spacing(4)] gap-(--gap)",
    },
    $p: {
      none: [
        "[&>.control:not(:nth-child(1_of_.control))]:rounded-s-none",
        "[&>.control:not(:nth-last-child(1_of_.control))]:rounded-e-none",
      ],
    },
  },
  defaultVariants: {
    $rounded: "xl",
    $layout: "vertical",
    $p: "sm",
    $gap: "auto",
  },
});
