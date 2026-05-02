import { cv, type StyleClassValue } from "clava";

const DEFAULT_LIGHTNESS_OFFSET = 5;
const DEFAULT_MIX_AMOUNT = 50;
const DEFAULT_CONTRAST_AMOUNT = 25;
const DEFAULT_CHROMA_OFFSET = 4;

export const CHROMA = ["muted", "balanced", "vivid", "neon"] as const;
export type Chroma = (typeof CHROMA)[number];

export const HUE = [
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
export type Hue = (typeof HUE)[number];

interface GetStyleClassOptions {
  var: string;
  class: string;
  value?: string | number | boolean;
  defaultValue?: number;
  multiplier?: number;
}

function getStyleClass(options: GetStyleClassOptions): StyleClassValue {
  if (!options.value) return {};
  if (options.value === true) {
    options.value = options.defaultValue;
  }
  if (options.multiplier != null) {
    options.value = `(${options.value}) * ${options.multiplier}`;
  }
  return {
    style: { [options.var]: `calc((${options.value}) / 100)` },
    class: options.class,
  };
}

function getLightnessOffsetStyleClass(options: GetStyleClassOptions) {
  return getStyleClass({
    multiplier: DEFAULT_LIGHTNESS_OFFSET,
    defaultValue: 1,
    ...options,
  });
}

function getChromaOffsetStyleClass(options: GetStyleClassOptions) {
  return getStyleClass({
    defaultValue: DEFAULT_CHROMA_OFFSET,
    ...options,
  });
}

function includes<T>(array: readonly T[], value: unknown): value is T {
  return array.includes(value as T);
}

export const layer = cv({
  variants: {
    /**
     * Enables the layer system, which allows you to modify the element's
     * background color in a relative, context-aware way.
     */
    $layer: "ak-layer",
    /**
     * Sets the element's base background color, which can be modified by other
     * layer variants. If unset, the element will inherit its background color
     * from its parent.
     */
    $bg: {
      unset: "",
      ghost: "bg-transparent",
      canvas: "ak-layer-canvas",
      brand: "ak-layer-brand",
      success: "ak-layer-success",
      warning: "ak-layer-warning",
      danger: "ak-layer-danger",
    },
    /**
     * Inverts the layer's base background color.
     */
    $invert: "ak-layer-invert",
  },
  computedVariants: {
    /**
     * Sets the absolute lightness of the background color.
     */
    $lightness: (value?: string | number) => {
      return getStyleClass({
        value,
        var: "--layer-lightness",
        class: "ak-layer-l-(--layer-lightness)",
      });
    },
    /**
     * Automatically adjusts the background color's lightness. The background
     * color becomes lighter or darker depending on its current lightness. The
     * value represents the **maximum** lightness offset, but it's not
     * guaranteed. If the user has high-contrast preferences, the offset will be
     * lower to allow for greater contrast between the layer and the text.
     *
     * If you want the opposite effect, where the offset increases as contrast
     * goes up, use `$bgPush` instead.
     */
    $bgOffset: (value?: string | number | boolean) => {
      return getLightnessOffsetStyleClass({
        value,
        var: "--layer-offset",
        class: "ak-layer-offset-(--layer-offset)",
      });
    },
    /**
     * Automatically adjusts the background color's lightness. The background
     * color becomes lighter or darker depending on its current lightness. The
     * value represents the **minimum** guaranteed lightness shift. If the user
     * has high-contrast preferences, the shift will be greater to allow for
     * more contrast between the layer and its parent.
     *
     * If you want the opposite effect, where the offset decreases as contrast
     * goes up, use `$bgOffset` instead.
     */
    $bgPush: (value?: string | number | boolean) => {
      return getLightnessOffsetStyleClass({
        value,
        var: "--layer-push",
        class: "ak-layer-push-(--layer-push)",
      });
    },
    /**
     * Lightens the layer by the specified amount.
     */
    $lighten: (value?: string | number | boolean) => {
      return getLightnessOffsetStyleClass({
        value,
        var: "--layer-lighten",
        class: "ak-layer-lighten-(--layer-lighten)",
      });
    },
    /**
     * Darkens the layer by the specified amount.
     */
    $darken: (value?: string | number | boolean) => {
      return getLightnessOffsetStyleClass({
        value,
        var: "--layer-darken",
        class: "ak-layer-darken-(--layer-darken)",
      });
    },
    /**
     * Sets the absolute chroma of the background color.
     */
    $chroma: (value?: Chroma | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA, value)) {
        const valueMap = {
          muted: "ak-layer-muted",
          balanced: "ak-layer-balanced",
          vivid: "ak-layer-vivid",
          neon: "ak-layer-neon",
        } satisfies Record<Chroma, string>;
        return valueMap[value];
      }
      return {
        style: { "--layer-chroma": `calc((${value}) / 100)` },
        class: `ak-layer-c-(--layer-chroma)`,
      };
    },
    /**
     * Sets the absolute hue of the background color.
     */
    $hue: (value?: Hue | (string & {}) | number) => {
      if (!value) return;
      if (includes(HUE, value)) {
        const valueMap = {
          red: "ak-layer-red",
          orange: "ak-layer-orange",
          yellow: "ak-layer-yellow",
          green: "ak-layer-green",
          cyan: "ak-layer-cyan",
          blue: "ak-layer-blue",
          magenta: "ak-layer-magenta",
          complementary: "ak-layer-complementary",
          split1: "ak-layer-split1",
          split2: "ak-layer-split2",
          analogous1: "ak-layer-analogous1",
          analogous2: "ak-layer-analogous2",
          triadic1: "ak-layer-triadic1",
          triadic2: "ak-layer-triadic2",
          tetradic1: "ak-layer-tetradic1",
          tetradic2: "ak-layer-tetradic2",
          tetradic3: "ak-layer-tetradic3",
          square1: "ak-layer-square1",
          square2: "ak-layer-square2",
          square3: "ak-layer-square3",
        } satisfies Record<Hue, string>;
        return valueMap[value];
      }
      return {
        style: { "--layer-hue": `${value}` },
        class: `ak-layer-h-(--layer-hue)`,
      };
    },
    /**
     * Increases the contrast between the layer and its parent.
     */
    $contrast: (value?: string | number | boolean) => {
      return getStyleClass({
        value,
        defaultValue: DEFAULT_CONTRAST_AMOUNT,
        var: "--layer-contrast",
        class: "ak-layer-contrast ak-layer-contrast-(--layer-contrast)",
      });
    },
    /**
     * Sets the minimum lightness of the background color.
     */
    $lightnessMin: (value?: string | number) => {
      return getStyleClass({
        value,
        var: "--layer-lightness-min",
        class: "ak-layer-min-(--layer-lightness-min)",
      });
    },
    /**
     * Sets the maximum lightness of the background color.
     */
    $lightnessMax: (value?: string | number) => {
      return getStyleClass({
        value,
        var: "--layer-lightness-max",
        class: "ak-layer-max-(--layer-lightness-max)",
      });
    },
    /**
     * Sets the minimum chroma of the background color.
     */
    $chromaMin: (value?: Chroma | "auto" | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA, value)) {
        const valueMap = {
          muted: "ak-layer-min-c-muted",
          balanced: "ak-layer-min-c-balanced",
          vivid: "ak-layer-min-c-vivid",
          neon: "ak-layer-min-c-neon",
          auto: "ak-layer-min-c-auto",
        } satisfies Record<Chroma | "auto", string>;
        return valueMap[value];
      }
      return {
        style: { "--layer-chroma": `calc((${value}) / 100)` },
        class: `ak-layer-min-c-(--layer-chroma)`,
      };
    },
    /**
     * Sets the maximum chroma of the background color.
     */
    $chromaMax: (value?: Chroma | "auto" | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA, value)) {
        const valueMap = {
          muted: "ak-layer-max-c-muted",
          balanced: "ak-layer-max-c-balanced",
          vivid: "ak-layer-max-c-vivid",
          neon: "ak-layer-max-c-neon",
          auto: "ak-layer-max-c-auto",
        } satisfies Record<Chroma | "auto", string>;
        return valueMap[value];
      }
      return {
        style: { "--layer-chroma": `calc((${value}) / 100)` },
        class: `ak-layer-max-c-(--layer-chroma)`,
      };
    },
    /**
     * Increases the background color's chroma by the specified amount.
     */
    $saturate: (value?: string | number | boolean) => {
      return getChromaOffsetStyleClass({
        value,
        var: "--layer-saturate",
        class: "ak-layer-saturate-(--layer-saturate)",
      });
    },
    /**
     * Decreases the background color's chroma by the specified amount.
     */
    $desaturate: (value?: string | number | boolean) => {
      return getChromaOffsetStyleClass({
        value,
        var: "--layer-desaturate",
        class: "ak-layer-desaturate-(--layer-desaturate)",
      });
    },
    /**
     * Sets how much the background color blends with the parent layer. The
     * value is the percentage of the background color mixed into the parent
     * layer.
     */
    $mix: (value?: string | number | boolean) => {
      if (!value) return;
      if (value === true) {
        value = DEFAULT_MIX_AMOUNT;
      }
      return {
        style: { "--layer-mix": `calc((${value}) * 1%)` },
        class: "ak-layer-mix ak-layer-mix-amount-(--layer-mix)",
      };
    },
  },
  defaultVariants: {
    $layer: true,
    $bg: "unset",
  },
  computed: ({ variants, setVariants }) => {
    // Ghost background doesn't support contrast
    if (variants.$contrast && variants.$bg === "ghost") {
      setVariants({ $contrast: false });
    }
  },
});
