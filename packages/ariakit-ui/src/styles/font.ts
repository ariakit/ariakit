import type { StyleClassValue } from "clava";
import { cv } from "clava";

const fontSizeClasses = {
  auto: "",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export type FontSizeName = keyof typeof fontSizeClasses;

// Named steps set the same custom property as numbers and strings, so all
// values share one line-height class. Tailwind emits a theme variable only when
// a class references it, so named steps can't use inline styles.
const fontLeadingClasses = {
  auto: "",
  none: "[--font-leading:1]",
  tight: "[--font-leading:var(--leading-tight)]",
  snug: "[--font-leading:var(--leading-snug)]",
  normal: "[--font-leading:var(--leading-normal)]",
  relaxed: "[--font-leading:var(--leading-relaxed)]",
  loose: "[--font-leading:var(--leading-loose)]",
};

export type FontLeadingName = keyof typeof fontLeadingClasses;

// Zero specificity lets any line-height class on the element win, whatever its
// name or place in Tailwind's order, while it still replaces an inherited line
// height. It also sets --tw-leading, which the line height of the text-*
// classes and of a numeric $size reads first.
const FONT_LEADING_CLASS = "ui-base:leading-(--font-leading)";

function isFontSizeName(value: unknown): value is FontSizeName {
  if (typeof value !== "string") return false;
  return Object.hasOwn(fontSizeClasses, value);
}

function isFontLeadingName(value: unknown): value is FontLeadingName {
  if (typeof value !== "string") return false;
  return Object.hasOwn(fontLeadingClasses, value);
}

/**
 * Resolves a font size: a named size to its Tailwind class, and a positive
 * number to a class that multiplies the font size of the parent. Extenders that
 * replace `$size` can delegate other values to it, so the named sizes and
 * numbers keep working. Other values return nothing.
 */
export function getFontSizeClass(
  value: unknown,
): StyleClassValue | string | undefined {
  if (isFontSizeName(value)) return fontSizeClasses[value];
  if (typeof value !== "number") return;
  if (!Number.isFinite(value)) return;
  if (value <= 0) return;
  return {
    // In line-height, lh is the parent's line height and em is this font size,
    // so 1em/scale is the parent font size. Smaller text takes off two pixels
    // of line height for each pixel of font size, like the Tailwind scale, so
    // 0.75 and 0.875 of 16px text with a 24px line get 16px and 20px lines. The
    // result stays between 1 and the parent's ratio. Larger text keeps that
    // ratio when the parent line is at most twice its font size, which covers
    // the Tailwind leading scale. tan(atan2(a,b)) divides lengths where Firefox
    // calc() cannot, and descendants inherit the ratio as a number. The line
    // height keeps this class with the text-* classes in Tailwind's order, so
    // caller classes from text-xs to text-xl and leading-* classes win.
    class:
      "text-[calc(var(--font-scale)*1em)]/(--tw-leading,clamp(1,tan(atan2(calc(1lh-2*(1em/var(--font-scale)-1em)),1em)),tan(atan2(1lh,calc(1em/var(--font-scale))))))",
    style: { "--font-scale": `${value}` },
  };
}

/**
 * Resolves a line height: a named step to the Tailwind leading scale, a
 * non-negative number to a unitless ratio, and another non-empty string to a
 * raw CSS value. Extenders that replace `$leading` can delegate other values to
 * it, so these values keep working. `auto` and other values return nothing.
 */
export function getFontLeadingClass(
  value: unknown,
): StyleClassValue | undefined {
  if (value === "auto") return;
  if (isFontLeadingName(value)) {
    return { class: [fontLeadingClasses[value], FONT_LEADING_CLASS] };
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return;
    if (value < 0) return;
    return {
      class: FONT_LEADING_CLASS,
      style: { "--font-leading": `${value}` },
    };
  }
  if (typeof value !== "string") return;
  if (!value) return;
  return { class: FONT_LEADING_CLASS, style: { "--font-leading": value } };
}

/**
 * Sets the font family, size, and line height. Slot frames, control groups,
 * carousels, and tables of contents extend it for the font size that their
 * padding, gaps, and slots scale with.
 */
export const font = cv({
  variants: {
    /**
     * Sets the font family to the `sans`, `serif`, or `mono` font of the theme.
     * `mono` also sets `font-size-adjust` to `0.48`, which keeps a consistent
     * x-height across platform monospace fonts. `sans` and `serif` set only the
     * family, so they keep an inherited adjustment. `auto`, the default,
     * inherits both.
     */
    $font: {
      auto: "",
      sans: "font-sans",
      serif: "font-serif",
      mono: "font-mono [font-size-adjust:0.48]",
    },
    /**
     * Sets the font size that padding, gaps, and icons scale with. Named sizes
     * use the Tailwind text scale, so `sm` always has the size of `text-sm`. A
     * positive number multiplies the font size of the parent, so `0.875` is
     * `0.875em`. A smaller number also takes off two pixels of line height for
     * each pixel of font size. The line-height ratio stays between 1 and the
     * ratio of the parent, and a larger number keeps the parent ratio when the
     * parent line is at most twice its font size. With the default Tailwind
     * theme, `0.75`, `0.875`, `1.125`, and `1.25` have the font sizes of `xs`,
     * `sm`, `lg`, and `xl` in 16px text, and `0.75` and `0.875` also have their
     * line heights. `$leading` replaces the line height of named sizes and
     * numbers. `auto`, the default of slot frames and control groups, inherits
     * both.
     */
    $size(value?: FontSizeName | number) {
      return getFontSizeClass(value);
    },
    /**
     * Sets the line height. Named steps use the Tailwind leading scale, so
     * `tight` has the line height of `leading-tight`, `none` is `1`, and
     * `normal` is the `1.5` of the scale, not the CSS keyword. A non-negative
     * number is a unitless ratio of the font size, such as `1.7`, which
     * descendants inherit as a ratio. Another string is a raw CSS value, such
     * as `1lh` or `var(--my-leading)`. It replaces the line height of a named
     * or numeric `$size`. It has zero specificity, so a line-height class on
     * the element, from the caller or an extender, wins over it. `auto`, the
     * default, keeps the line height of `$size` or the parent.
     */
    $leading(value?: FontLeadingName | number | (string & {})) {
      return getFontLeadingClass(value);
    },
  },
  defaultVariants: {
    $font: "auto",
    $size: "auto",
    $leading: "auto",
  },
});
