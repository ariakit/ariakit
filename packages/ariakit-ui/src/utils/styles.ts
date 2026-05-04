import type { StyleClassValue } from "clava";

const LIGHTNESS_MULTIPLIER = 5;
const DEFAULT_CHROMA_OFFSET = 4;

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
type OptionalStyleValue = StyleValue | boolean | undefined;

interface GetScaledStyleClassParams {
  class: string;
  property: `--${string}`;
  value?: OptionalStyleValue;
  defaultValue?: StyleValue;
  multiplier?: StyleValue;
  unit?: "%";
  allowZero?: boolean;
}

interface GetScaledStyleValueOptions {
  multiplier?: StyleValue;
  unit?: "%";
}

export function getScaledStyleValue(
  value: StyleValue,
  { multiplier, unit }: GetScaledStyleValueOptions = {},
) {
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
    multiplier: LIGHTNESS_MULTIPLIER,
    ...params,
  });
}

export function getChromaStyleClass(params: GetScaledStyleClassParams) {
  return getScaledStyleClass({
    defaultValue: DEFAULT_CHROMA_OFFSET,
    ...params,
  });
}
