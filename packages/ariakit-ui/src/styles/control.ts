import { cv } from "clava";
import { background } from "./background.ts";
import { border, isBorderColor } from "./border.ts";

export const control = cv({
  extend: [background, border],
  class: [
    "group/control flex px-(--px) py-(--py)",
    "[--parent-background:var(--ak-layer-parent)]",
    "[--px:calc(var(--ak-frame-padding,0px)+(1lh-1cap)*var(--px-scale))]",
    "[--py:var(--ak-frame-padding,0px)]",
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
     * Sets the element’s border radius.
     */
    $radius: {
      none: "",
      field: "ak-frame-rounded-field",
      badge: "ak-frame-rounded-badge",
      round: "ak-frame-rounded-full",
      card: "ak-frame-rounded-card",
    },
    /**
     * Sets the element’s padding. By default, it’s based on the element’s
     * radius.
     */
    $padding: {
      none: "",
      field: "ak-frame-p-field",
      badge: "ak-frame-p-badge",
      round: "ak-frame-p-field",
      card: "ak-frame-p-field-card",
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
      "disabled ak-layer-pop-0.5 cursor-not-allowed! ak-text/0! border-transparent! ring-transparent! inset-shadow-none! bg-none! shadow-none!",
  },
  defaultVariants: {
    $size: "auto",
    $radius: "field",
    $gap: "md",
    $gapY: "auto",
    $px: "md",
  },
  computed: ({ variants, setDefaultVariants }) => {
    setDefaultVariants({ $padding: variants.$radius });
    if (variants.$padding === "none") {
      return setDefaultVariants({ $px: "none" });
    }
  },
});

export const controlIcon = cv({
  extend: [background, border],
  class: [
    "flex flex-none items-center justify-center",
    "[--mx:calc(var(--py)-var(--px)+var(--half-line-gap))]",
    "[--my:calc(var(--half-line-gap)*var(--row-span))]",
    "[--half-line-gap:calc((1lh-var(--size,1lh))/2)]",
    "min-w-(--size) h-[calc(var(--size)*var(--row-span))]",
    "[&>svg]:block [&>svg]:size-(--size)",
    // debug
    // "relative after:absolute after:-inset-[calc(var(--half-line-gap)+var(--py))] after:bg-yellow-500/40",
  ],
  variants: {
    $bg: {
      // When control's bg is inverted, we need to make the pop effect more
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
      "2xl": "[--size:calc(1lh+var(--py))]",
      full: "[--size:calc(1lh+var(--py)*2)]",
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
      sm: "px-[calc(clamp(0.1em,var(--size)*0.1,0.2em))]",
      md: "px-[calc(clamp(0.1em,var(--size)*0.25,0.4em))]",
    },
    $radius: {
      none: "",
      auto: "rounded-[max(var(--radius)/2,var(--ak-frame-radius)-var(--py)-var(--half-line-gap))]",
      round: "rounded-full",
    },
    $square: "aspect-square",
    $closeGap: "[&+*]:-ms-[0.25em] [*:has(+&)]:-me-[0.25em]",
    $text: "text-[0.8125em]_ _leading-[1lh]",
    $badge: {
      false: "mx-(--mx) my-(--my)",
      true: "text-[0.8125em] leading-[1lh] mx-[calc((var(--py)-var(--px))*0.8125+var(--half-line-gap))] my-[calc(var(--my)*1)]",
      floating:
        "text-[0.8125em] leading-[1lh] absolute top-0 end-0 -translate-y-1/2 translate-x-[calc(var(--size)/2)] border border-(--parent-background)",
    },
  },
  computedVariants: {
    $rowSpan: (value: number) => ({ "--row-span": `${value}` }),
  },
  defaultVariants: {
    $bg: "none",
    $size: "md",
    $radius: "auto",
    $rowSpan: 1,
    $px: "none",
    $square: true,
  },
  computed: ({ variants, setVariants, setDefaultVariants }) => {
    setDefaultVariants({ $mx: variants.$size });
    const classes: string[] = [];

    if (variants.$closeGap) {
      return setVariants({ $mx: "none" });
    }
    const mdOrLess = [undefined, "none", "xs", "sm", "md"];
    if (variants.$bg !== "none") {
      // When bg is set, give some room for the background to show
      const $size = mdOrLess.includes(variants.$size) ? "lg" : variants.$size;
      const $px = variants.$px === "none" ? "sm" : variants.$px;
      setVariants({ $size, $px });
      setDefaultVariants({ $mx: $size });
    }
    if (variants.$badge) {
      const lgOrLess = [...mdOrLess, "lg"];
      const $size = lgOrLess.includes(variants.$size) ? "xl" : variants.$size;
      const $bg = variants.$bg === "none" ? "primary" : variants.$bg;
      const $px = variants.$px === "none" ? "md" : variants.$px;
      if (isBorderColor(variants.$bg)) {
        setDefaultVariants({ $borderColor: variants.$bg });
      }
      setVariants({ $size, $bg, $px });
      setDefaultVariants({
        $mx: $size,
        $square: false,
        $contrast: true,
        $radius: "round",
      });
    }
    if (variants.$bg !== "none") {
      // Disabled control
      classes.push(
        "group-[.disabled]/control:ak-layer-down group-[.disabled]/control:ak-text/0",
      );
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
    $orientation: "horizontal",
  },
});

export const controlLabel = cv({
  class: "group-[.flex-col]/control-content:flex-none grow",
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
