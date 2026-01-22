import { cv } from "clava";
import { background } from "./background.ts";
import { border } from "./border.ts";

export const field = cv({
  extend: [background, border],
  class: [
    "group/field flex px-(--px) py-(--py)",
    "[--px:calc(var(--ak-frame-padding,0px)+(1lh-1cap)*var(--px-scale))]",
    "[--py:var(--ak-frame-padding,0px)]",
    // font sidebearing
    "[--sb:0.2em]",
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

export const fieldIcon = cv({
  class: [
    "flex flex-none items-center justify-center",
    "[--slot-mx:calc(var(--py)-var(--px)+var(--half-line-gap))]",
    "[--half-line-gap:calc((1lh-var(--size,1lh))/2)]",
    "mx-(--slot-mx) my-[calc(var(--half-line-gap)*var(--row-span))] min-w-(--size) h-[calc(var(--size)*var(--row-span))]",
    "[&>svg]:block [&>svg]:size-(--size)",
  ],
  variants: {
    $bg: {
      none: "",
      pop: [
        "ak-layer-pop",
        // When field's bg is inverted, we need to make the pop effect more
        // pronounced so it's still visible.
        "group-[.background-invert]/field:ak-layer-pop-2.5",
      ],
      darker: "ak-layer-down",
      lighter: "ak-layer",
      invert: "ak-layer-pop-12",
      primary: "ak-layer-primary",
      secondary: "ak-layer-secondary",
      success: "ak-layer-success",
      warning: "ak-layer-warning",
      danger: "ak-layer-danger",
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
      auto: "px-[calc(clamp(0.1em,var(--size)*0.1,0.2em))]",
      text: "px-[calc(clamp(0.1em,var(--size)*0.25,0.3em))]",
    },
    $radius: {
      none: "",
      auto: "rounded-[max(var(--radius)/2,var(--ak-frame-radius)-var(--py)-var(--half-line-gap))]",
      round: "rounded-full",
    },
    $square: "aspect-square",
    $closeGap: "[&+*]:-ms-[0.25em] [*:has(+&)]:-me-[0.25em]",
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
    if (variants.$closeGap) {
      return setVariants({ $mx: "none" });
    }
    if (variants.$bg !== "none") {
      // When bg is set, give some room for the background to show
      const $size = variants.$size === "none" ? "lg" : variants.$size;
      const $px = variants.$px === "none" ? "auto" : variants.$px;
      setDefaultVariants({ $px, $size, $mx: $size });
      // Disabled field
      return "group-[.disabled]/field:ak-layer-down group-[.disabled]/field:ak-text/0 [&>svg]:size-[1em]!";
    }
  },
});

export const fieldContent = cv({
  class:
    "group/field-content flex flex-1 min-w-0 content-start text-start gap-x-(--gap) gap-y-(--gap-y)",
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

export const fieldLabel = cv({
  class: "group-[.flex-col]/field-content:flex-none grow",
  variants: {
    $truncate: "truncate",
  },
});

export const fieldDescription = cv({
  class:
    "ms-0! ak-text/70 basis-full font-normal text-[0.875em] group-[.disabled]/field:ak-text/0",
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
