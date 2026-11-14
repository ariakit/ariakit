import type { StyleClassValue } from "clava";
import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import {
  CHROMA_VALUES,
  COLOR_VALUES,
  HUE_VALUES,
  getScaledStyleClass,
} from "../utils/styles.ts";
import type { ChromaValues, ColorValues, HueValues } from "../utils/styles.ts";
import { ink } from "./ink.ts";

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
 * Color adjustments for adaptive text. They only set color inputs; `text`
 * enables the adaptive color that reads them.
 */
const textModifiers = cv({
  variants: {
    /**
     * Sets the minimum lightness shift beyond the readability floor, from `0`
     * to `100`. The shift increases with `--contrast`.
     */
    $textPush(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-push",
        class: "ui-text:ak-text-push-(--text-push)",
      });
    },
    /** Lightens the text color by the specified amount (0-100). */
    $textLighten(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-lighten",
        class: "ui-text:ak-text-lighten-(--text-lighten)",
      });
    },
    /** Darkens the text color by the specified amount (0-100). */
    $textDarken(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-darken",
        class: "ui-text:ak-text-darken-(--text-darken)",
      });
    },
    /**
     * Sets the minimum lightness (0-100) of the text color after all other text
     * variants have been applied.
     */
    $textLightnessMin(value?: string | number) {
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--text-lightness-min",
        class: "ui-text:ak-text-min-(--text-lightness-min)",
      });
    },
    /**
     * Sets the maximum lightness (0-100) of the text color after all other text
     * variants have been applied.
     */
    $textLightnessMax(value?: string | number) {
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--text-lightness-max",
        class: "ui-text:ak-text-max-(--text-lightness-max)",
      });
    },
    /**
     * Sets the exact chroma of the text color. Accepts either a named chroma
     * like `"muted"` (`5`), `"balanced"` (`15`), `"vivid"` (`22`), or `"neon"`
     * (`32`), or a numeric value like `40`.
     */
    $textChroma(value?: ChromaValues | (string & {}) | number) {
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ui-text:ak-text-muted",
          balanced: "ui-text:ak-text-balanced",
          vivid: "ui-text:ak-text-vivid",
          neon: "ui-text:ak-text-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--text-chroma",
        class: "ui-text:ak-text-c-(--text-chroma)",
      });
    },
    /** Increases the text chroma by the specified amount (0-40). */
    $textSaturate(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-saturate",
        class: "ui-text:ak-text-saturate-(--text-saturate)",
      });
    },
    /** Decreases the text chroma by the specified amount (0-40). */
    $textDesaturate(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-desaturate",
        class: "ui-text:ak-text-desaturate-(--text-desaturate)",
      });
    },
    /**
     * Shifts the text hue toward the warm hue by the specified amount (0-100).
     */
    $textWarm(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-warm",
        class: "ui-text:ak-text-warm-(--text-warm)",
      });
    },
    /**
     * Shifts the text hue toward the cool hue by the specified amount (0-100).
     */
    $textCool(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-cool",
        class: "ui-text:ak-text-cool-(--text-cool)",
      });
    },
    /**
     * Sets the minimum chroma (0-40) of the text color after all other text
     * variants have been applied.
     */
    $textChromaMin(value?: ChromaValues | (string & {}) | number) {
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ui-text:ak-text-min-c-muted",
          balanced: "ui-text:ak-text-min-c-balanced",
          vivid: "ui-text:ak-text-min-c-vivid",
          neon: "ui-text:ak-text-min-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--text-chroma-min",
        class: "ui-text:ak-text-min-c-(--text-chroma-min)",
      });
    },
    /**
     * Sets the maximum chroma (0-40) of the text color after all other text
     * variants have been applied.
     */
    $textChromaMax(value?: ChromaValues | (string & {}) | number) {
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ui-text:ak-text-max-c-muted",
          balanced: "ui-text:ak-text-max-c-balanced",
          vivid: "ui-text:ak-text-max-c-vivid",
          neon: "ui-text:ak-text-max-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--text-chroma-max",
        class: "ui-text:ak-text-max-c-(--text-chroma-max)",
      });
    },
    /**
     * Sets the exact hue of the text color. Accepts a named hue like `"red"` or
     * `"blue"`, a color harmony like `"complementary"`, or a degree value like
     * `240`.
     */
    $textHue(value?: HueValues | (string & {}) | number) {
      if (value == null) return;
      if (value === "") return;
      if (includes(HUE_VALUES, value)) {
        const valueMap = {
          red: "ui-text:ak-text-red",
          orange: "ui-text:ak-text-orange",
          yellow: "ui-text:ak-text-yellow",
          green: "ui-text:ak-text-green",
          cyan: "ui-text:ak-text-cyan",
          blue: "ui-text:ak-text-blue",
          magenta: "ui-text:ak-text-magenta",
          complementary: "ui-text:ak-text-complementary",
          split1: "ui-text:ak-text-split1",
          split2: "ui-text:ak-text-split2",
          analogous1: "ui-text:ak-text-analogous1",
          analogous2: "ui-text:ak-text-analogous2",
          triadic1: "ui-text:ak-text-triadic1",
          triadic2: "ui-text:ak-text-triadic2",
          tetradic1: "ui-text:ak-text-tetradic1",
          tetradic2: "ui-text:ak-text-tetradic2",
          tetradic3: "ui-text:ak-text-tetradic3",
          square1: "ui-text:ak-text-square1",
          square2: "ui-text:ak-text-square2",
          square3: "ui-text:ak-text-square3",
        } satisfies Record<HueValues, string>;
        return valueMap[value];
      }
      return {
        class: "ui-text:ak-text-h-(--text-hue)",
        style: { "--text-hue": `${value}` },
      };
    },
  },
});

/**
 * Text with a font, a strength, and an adaptive color. Without a color variant,
 * it sets no color, so it also applies to regular text. An ancestor with color
 * variants colors it. On a `$layer` element, the color variants affect nested
 * `$text` or SVG elements, not text directly inside the layer. Slot frames,
 * control groups, carousels, and tables of contents extend it for the font size
 * that their padding, gaps, and slots scale with.
 */
export const text = cv({
  extend: [ink, textModifiers],
  class: "text",
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
     * numbers. `auto`, the default, inherits both.
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
    /**
     * Sets the base text color. `true` adapts the parent layer color to meet
     * WCAG AA contrast; a color sets the base explicitly. `false` disables the
     * text system. Other text variants adjust this color. A variant that emits
     * output also enables it by default.
     */
    $text(value?: ColorValues | (string & {}) | boolean) {
      if (!value) return;
      if (value === true) {
        return "ui-text:ak-text";
      }
      if (includes(COLOR_VALUES, value)) {
        const colorMap = {
          canvas: "ui-text:ak-text ui-text:ak-text-canvas",
          brand: "ui-text:ak-text ui-text:ak-text-brand",
          secondary: "ui-text:ak-text ui-text:ak-text-secondary",
          success: "ui-text:ak-text ui-text:ak-text-success",
          warning: "ui-text:ak-text ui-text:ak-text-warning",
          danger: "ui-text:ak-text ui-text:ak-text-danger",
        } satisfies Record<ColorValues, string>;
        return colorMap[value];
      }
      return {
        class: "ui-text:ak-text ui-text:ak-text-color-(--text-color)",
        style: { "--text-color": value },
      };
    },
  },
  defaultVariants: {
    $font: "auto",
    $size: "auto",
    $leading: "auto",
    $text(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A color modifier needs the adaptive color to take effect. The font
      // variants and `$ink` do not. Explicit values and static extender
      // defaults still win. A computed extender default receives `true` as its
      // `defaultValue`.
      if (textModifiers.class(variants)) return true;
      return defaultValue;
    },
  },
});
