import type { StyleClassValue } from "clava";

const LIGHTNESS_MULTIPLIER = 6;
const DEFAULT_CHROMA_OFFSET = 4;

export const COLOR_VALUES = [
  "canvas",
  "brand",
  "secondary",
  "success",
  "warning",
  "danger",
] as const;
export type ColorValues = (typeof COLOR_VALUES)[number];

export const CHROMA_VALUES = ["muted", "balanced", "vivid", "neon"] as const;
export type ChromaValues = (typeof CHROMA_VALUES)[number];

export const HUE_VALUES = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "magenta",
  "complementary",
  "split1",
  "split2",
  "analogous1",
  "analogous2",
  "triadic1",
  "triadic2",
  "tetradic1",
  "tetradic2",
  "tetradic3",
  "square1",
  "square2",
  "square3",
] as const;
export type HueValues = (typeof HUE_VALUES)[number];

type StyleValue = string | number;
type OptionalStyleValue = StyleValue | boolean | null | undefined;

/**
 * Converts a spacing prop value to CSS: numbers scale the `--spacing` theme
 * token and strings pass through as raw lengths or expressions.
 */
export function getSpacingValue(value: string | number) {
  return typeof value === "string"
    ? value
    : `calc(var(--spacing) * (${value}))`;
}

/**
 * Converts a padding prop value to CSS: numbers scale the `--spacing` theme
 * token and round to a whole pixel, and strings pass through as raw lengths or
 * expressions.
 */
export function getPaddingValue(value: string | number) {
  if (typeof value === "string") return value;
  // One spacing step is 3.5px at 14px text. Chrome paints the half pixel on one
  // side, so a slot that fills the line would sit 1px off center.
  return `round(${getSpacingValue(value)}, 1px)`;
}

/**
 * Converts a spacing prop value to CSS, like `getSpacingValue`, but numbers
 * scale the resolved step of the nearest spacing context. Use it on a spacing
 * context for a length that its parts share, such as the indentation of the
 * button and the body of a disclosure. On the context itself, `--spacing` stays
 * in em, so a length from `getSpacingValue` would resolve against the text size
 * of each part. Use it only on a spacing context: outside one, the step is 0.
 */
export function getContextSpacingValue(value: string | number) {
  return typeof value === "string"
    ? value
    : `calc(var(--spacing-context) * (${value}))`;
}

/**
 * Converts a spacing prop value to CSS, like `getSpacingValue`, but numbers
 * scale the `--spacing-em` step. The value stays in em, so each element that
 * reads it resolves it against its own text size. Use it for a length that a
 * component gives to its controls, such as the gap between the slots of the
 * rows of a navigation. Then a row with smaller text gets a smaller length.
 */
export function getEmSpacingValue(value: string | number) {
  return typeof value === "string"
    ? value
    : `calc(var(--spacing-em) * (${value}))`;
}

/**
 * Converts a padding prop value to CSS, like `getPaddingValue`, but numbers
 * scale the `--spacing-em` step. Use it for a padding that a component gives to
 * its controls, such as the padding of the rows of a list.
 */
export function getEmPaddingValue(value: string | number) {
  if (typeof value === "string") return value;
  return `round(${getEmSpacingValue(value)}, 1px)`;
}

interface GetScaledStyleClassParams {
  /** Class name to emit when the value produces a style class. */
  class: string;
  /** CSS custom property that receives the scaled value. */
  property: `--${string}`;
  /** Raw value from the component prop; use `true` to apply the default. */
  value?: OptionalStyleValue;
  /** Fallback value used when `value` is `true`. */
  defaultValue?: StyleValue;
  /** Scale factor for non-percent values before writing the CSS property. */
  multiplier?: StyleValue;
  /**
   * Output unit mode; use `%` when the value should map directly to percent.
   */
  unit?: "%";
  /** Allows zero values to generate a style class instead of being ignored. */
  allowZero?: boolean;
}

interface GetScaledStyleValueOptions extends Pick<
  GetScaledStyleClassParams,
  "multiplier" | "unit"
> {}

export function getScaledStyleValue(
  value: StyleValue,
  options: GetScaledStyleValueOptions = {},
) {
  const { multiplier, unit } = options;
  if (unit === "%") {
    return `calc((${value}) * 1%)`;
  }
  if (multiplier != null) {
    return `calc((${value}) * ${multiplier} / 100)`;
  }
  return `calc((${value}) / 100)`;
}

export function getScaledStyleClass({
  value,
  class: className,
  property,
  defaultValue,
  multiplier,
  unit,
  allowZero,
}: GetScaledStyleClassParams): StyleClassValue | undefined {
  if (value == null) return;
  if (value === false) return;
  if (value === "") return;
  if (!allowZero && !value) return;
  const styleValue = value === true ? defaultValue : value;
  if (styleValue == null) return;
  return {
    class: className,
    style: {
      [property]: getScaledStyleValue(styleValue, { multiplier, unit }),
    },
  };
}

export function getLightnessStyleClass(params: GetScaledStyleClassParams) {
  return getScaledStyleClass({
    defaultValue: 1,
    multiplier: `calc(${LIGHTNESS_MULTIPLIER} * var(--layer-lightness-multiplier, 1))`,
    ...params,
  });
}

export function getChromaStyleClass(params: GetScaledStyleClassParams) {
  return getScaledStyleClass({
    defaultValue: DEFAULT_CHROMA_OFFSET,
    ...params,
  });
}
