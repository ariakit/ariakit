import type { StyleClassValue } from "clava";
import { cv } from "clava";

const NAMED_FONT_SIZES = {
  auto: "",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export type FontSizeName = keyof typeof NAMED_FONT_SIZES;

function isFontSizeName(value: unknown): value is FontSizeName {
  if (typeof value !== "string") return false;
  return Object.hasOwn(NAMED_FONT_SIZES, value);
}

/**
 * Resolves a font size: a named size to its Tailwind class, and a positive
 * number to a class that multiplies the font size and the line height of the
 * parent. Extenders that replace `$size` can delegate other values to it, so
 * the named sizes and numbers keep working. Other values return nothing.
 */
export function getFontSizeClass(
  value: unknown,
): StyleClassValue | string | undefined {
  if (isFontSizeName(value)) return NAMED_FONT_SIZES[value];
  if (typeof value !== "number") return;
  if (!Number.isFinite(value)) return;
  if (value <= 0) return;
  return {
    // In line-height, lh is the parent's line height and em is this font size,
    // so this is the parent's line-height ratio, which descendants inherit as a
    // number. tan(atan2(a,b)) divides lengths where Firefox calc() cannot. The
    // line height keeps this class with the text-* classes in Tailwind's order,
    // so caller classes from text-xs to text-xl and leading-* classes win.
    class:
      "text-[calc(var(--font-scale)*1em)]/(--tw-leading,tan(atan2(1lh,calc(1em/var(--font-scale)))))",
    style: { "--font-scale": `${value}` },
  };
}

/**
 * The `$size` variant of slot frames, control groups, and tables of contents.
 * It sets the font size that their padding, gaps, and slots scale with.
 */
export const fontSize = cv({
  variants: {
    /**
     * Sets the font size that padding, gaps, and icons scale with. Named sizes
     * use the Tailwind text scale, so `sm` always has the size of `text-sm`. A
     * positive number multiplies the font size and the line height of the
     * parent, so `0.875` is `0.875em`. With the default Tailwind theme, `0.75`,
     * `0.875`, `1.125`, and `1.25` have the font sizes of `xs`, `sm`, `lg`, and
     * `xl` in 16px text. `auto`, the default of slot frames and control groups,
     * inherits both.
     */
    $size(value?: FontSizeName | number) {
      return getFontSizeClass(value);
    },
  },
  defaultVariants: {
    $size: "auto",
  },
});
