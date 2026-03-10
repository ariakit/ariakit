import { cv } from "clava";
import { border, isBorderColor } from "./border.ts";
import { frame } from "./frame.ts";
import { layer } from "./layer.ts";
import { text } from "./text.ts";

export const control = cv({
  extend: [layer, frame, text],
  class: [
    "control group/control relative flex justify-center",
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
    $disabled: [
      "disabled cursor-not-allowed!",
      "border-transparent! ring-transparent! inset-shadow-none! shadow-none!",
      "bg-none! ak-text/0! *:ak-text/0!",
    ],
  },
  defaultVariants: {
    $size: "auto",
    $rounded: "md",
    $p: "md",
    $px: "md",
    $gap: "md",
    $gapY: "auto",
  },
  computed: ({ variants, setDefaultVariants, addClass }) => {
    if (variants.$disabled) {
      setDefaultVariants({ $bg: "disabled" });
    }
    if (variants.$p === "none") {
      setDefaultVariants({ $px: "none" });
    } else {
      addClass([
        "[--px:calc(var(--ak-frame-padding,0px)+(1lh-1cap)*var(--px-scale))]",
        "[--py:calc(var(--ak-frame-padding,0px))]",
        "px-[calc(var(--px)+var(--inset-padding,0px))]",
        "py-[calc(var(--py)+var(--inset-padding,0px))]",
      ]);
    }
  },
});

export const controlSlot = cv({
  extend: [layer, border, text],
  class: [
    "flex flex-none items-center justify-center",
    "[--my:calc((1lh-var(--size,1lh))/2*var(--row-span))]",
    "[--mx:calc((var(--py)-var(--px))+var(--my))]",
    "min-w-(--size) h-[calc(var(--size)*var(--row-span))]",
    "[&>svg]:block [&>svg]:size-(--size) mx-(--mx) my-(--my)",
  ],
  variants: {
    $bg: {
      // When the frame's bg is inverted, we need to make the pop effect more
      // pronounced so it's still visible.
      pop: "group-[.layer-invert]/control:ak-layer-pop-2.5",
    },
    /**
     * Sets the slot size.
     */
    $size: {
      unset: "",
      xs: "[--size:1ex]",
      sm: "[--size:1cap]",
      md: "[--size:1em]",
      lg: "[--size:0.875lh]",
      xl: "[--size:1lh]",
      "2xl": "[--size:calc(1lh+var(--py)/var(--row-span))]",
      full: "[--size:calc(1lh+var(--py)*2/var(--row-span))]",
    },
    /**
     * Controls the slot's horizontal margin. By default, it's set based on the
     * slot size. The larger the slot, the larger the margin. Set to `closeGap`
     * to move the slot closer to the control's text.
     */
    $mx: {
      unset: "",
      closeGap: "[&+*]:-ms-1 [*:has(+&)]:-me-1",
      xs: "[&+*]:-ms-(--sb) [*:has(+&)]:-me-(--sb)",
      sm: "[&+*]:-ms-(--sb) [*:has(+&)]:-me-(--sb)",
      md: "",
      lg: "",
      xl: "[&+*]:ms-(--sb) [*:has(+&)]:me-(--sb)",
      "2xl": "[&+*]:ms-(--py) [*:has(+&)]:me-(--py)",
      full: " [&+*]:ms-[1cap] [*:has(+&)]:me-[1cap]",
    },
    /**
     * Sets the slot padding.
     */
    $p: {
      unset: "",
      xs: "px-[calc(var(--size)*0.05)]",
      sm: "px-[calc(var(--size)*0.1)]",
      md: "px-[calc(var(--size)*0.15)]",
      lg: "px-[calc(var(--size)*0.15)]",
      xl: "px-[calc(var(--size)*0.2)]",
      "2xl": "px-[calc(var(--size)*0.25)]",
      full: "px-[calc(var(--size)*0.25)]",
    },
    /**
     * Sets the element’s border radius. Use `auto` for a concentric border
     * radius.
     */
    $rounded: {
      none: "",
      auto: "ak-frame ak-frame-m-(--my)",
      full: "rounded-full",
    },
    /**
     * Sets the element’s kind. When you use the `badge` kind, wrap the text in
     * a `<span>` element so it’s styled correctly.
     */
    $kind: {
      icon: "",
      shortcut: "",
      avatar: "overflow-clip",
      badge: "*:text-[0.8125em]",
    },
    /**
     * Sets the slot to be a square.
     */
    $square: "aspect-square",
    /**
     * Renders the slot as a floating element in the top-right corner.
     */
    $floating:
      "m-0! absolute top-0 end-0 -translate-y-1/2 translate-x-[calc(var(--size)/2)] border border-(--parent-background)",
  },
  computedVariants: {
    /**
     * Increases the element’s size by a specified number of rows. This is
     * useful when a control spans multiple rows of content, such as a
     * description, and you want the slot to expand to match the content. Leave
     * it as `1` if you want the slot to match the first row’s size and align
     * with it.
     */
    $rowSpan: (value: number) => ({ "--row-span": `${value}` }),
  },
  defaultVariants: {
    $kind: "icon",
    $bg: "unset",
    $size: "md",
    $rounded: "auto",
    $p: "unset",
    $rowSpan: 1,
  },
  computed: ({ variants, setVariants, setDefaultVariants, addClass }) => {
    setDefaultVariants({ $mx: variants.$size });

    const mdOrLess = [undefined, "none", "xs", "sm", "md"];
    const lgOrLess = [...mdOrLess, "lg"];

    // When a background is set, we adjust the slot’s size and padding to give
    // it room to breathe.
    if (variants.$bg !== "unset") {
      const $size = mdOrLess.includes(variants.$size) ? "lg" : variants.$size;
      setVariants({ $size });
      setDefaultVariants({ $mx: $size, $p: $size });
      // Disabled frame
      addClass([
        "group-[.disabled]/control:ak-layer-down",
        "group-[.disabled]/control:ak-text/0",
      ]);
    }

    if (variants.$kind === "badge") {
      const $size = lgOrLess.includes(variants.$size) ? "xl" : variants.$size;
      const $bg = variants.$bg === "unset" ? "primary" : variants.$bg;
      if (isBorderColor($bg)) {
        setDefaultVariants({ $borderColor: $bg });
      }
      setVariants({ $size, $bg });
      setDefaultVariants({
        $p: $size,
        $mx: $size,
        $color: "tonal",
        $contrast: true,
        $textOpacity: 60,
      });
    }

    if (variants.$kind === "avatar") {
      const $size = lgOrLess.includes(variants.$size) ? "xl" : variants.$size;
      const $bg = variants.$bg === "unset" ? "pop" : variants.$bg;
      setVariants({ $size, $bg });
      setDefaultVariants({ $mx: $size, $rounded: "full" });
    }

    if (variants.$floating) {
      setDefaultVariants({ $rounded: "full", $color: "auto" });
    }

    if (variants.$kind && ["icon", "avatar"].includes(variants.$kind)) {
      setDefaultVariants({ $square: true });
    }
  },
});

export const controlContent = cv({
  class:
    "group/control-content flex-1 min-w-0 content-start text-start gap-x-(--gap) gap-y-(--gap-y)",
  variants: {
    $orientation: {
      unset: "",
      horizontal: "flex flex-wrap",
      vertical: "flex flex-col",
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
    "h-(--size) border-e-(length:--border-width) -mx-[calc((var(--ak-frame-padding,0px)+var(--border-width))/2)]",
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
      full: "self-stretch ak-edge -my-(--ak-frame-padding,0px) mx-0",
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
  extend: [layer, frame],
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
      horizontal: [
        "flex",
        "[&>.control:not(:nth-child(1_of_.control))]:-ms-[calc(var(--ak-frame-border)/2)]",
        "[&>.control:not(:nth-last-child(1_of_.control))]:-me-[calc(var(--ak-frame-border)/2)]",
      ],
      vertical: "vertical flex flex-col [&>.control]:justify-start",
    },
    $gap: {
      none: "",
      auto: "[--group-gap:var(--ak-frame-padding,0px)] gap-(--group-gap)",
      xs: "[--group-gap:--spacing(0.5)] gap-(--group-gap)",
      sm: "[--group-gap:--spacing(1)] gap-(--group-gap)",
      md: "[--group-gap:--spacing(2)] gap-(--group-gap)",
      lg: "[--group-gap:--spacing(3)] gap-(--group-gap)",
      xl: "[--group-gap:--spacing(4)] gap-(--group-gap)",
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
    $layout: "horizontal",
    $p: "sm",
    $gap: "auto",
  },
});
