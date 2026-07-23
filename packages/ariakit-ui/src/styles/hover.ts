import { cv } from "clava";
import {
  getChromaStyleClass,
  getLightnessStyleClass,
} from "../utils/styles.ts";

export const hover = cv({
  variants: {
    /**
     * Automatically adjusts the layer's lightness when the element is hovered.
     * The background color becomes lighter or darker depending on its current
     * lightness. The value represents the **maximum** lightness offset, but
     * it's not guaranteed. If the user has high-contrast preferences, the
     * offset will be lower to allow for greater contrast between the layer and
     * the text.
     *
     * When used on a layer with `$invert`, the amount is automatically
     * increased because the perceived difference in lightness is less
     * noticeable when there is high contrast between the layer and its parent.
     *
     * If you want the opposite effect, where the offset increases as contrast
     * goes up, use `$hoverPush` instead.
     */
    $hoverOffset(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--hover-offset",
        class: "ui-hover:ak-state-(--hover-offset)",
      });
    },
    /**
     * Automatically adjusts the layer's lightness when the element is hovered.
     * The background color becomes lighter or darker depending on its current
     * lightness. The value represents the **minimum** guaranteed lightness
     * shift. If the user has high-contrast preferences, the shift will be
     * greater to allow for more contrast between the layer and its parent.
     *
     * When used on a layer with `$invert`, the amount is automatically
     * increased because the perceived difference in lightness is less
     * noticeable when there is high contrast between the layer and its parent.
     *
     * If you want the opposite effect, where the offset decreases as contrast
     * goes up, use `$hoverOffset` instead.
     */
    $hoverPush(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--hover-push",
        class: "ui-hover:ak-state-push-(--hover-push)",
      });
    },
    /**
     * Lightens the layer when the element is hovered by the specified amount.
     * When set to `true`, it lightens the layer by one step.
     */
    $hoverLighten(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--hover-lighten",
        class: "ui-hover:ak-state-lighten-(--hover-lighten)",
      });
    },
    /**
     * Darkens the layer when the element is hovered by the specified amount.
     * When set to `true`, it darkens the layer by one step.
     */
    $hoverDarken(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--hover-darken",
        class: "ui-hover:ak-state-darken-(--hover-darken)",
      });
    },
    /**
     * Increases the layer chroma when the element is hovered by the specified
     * amount. When set to `true`, it increases the chroma by one step.
     */
    $hoverSaturate(value?: string | number | boolean) {
      return getChromaStyleClass({
        value,
        property: "--hover-saturate",
        class: "ui-hover:ak-state-saturate-(--hover-saturate)",
      });
    },
    /**
     * Decreases the layer chroma when the element is hovered by the specified
     * amount. When set to `true`, it decreases the chroma by one step.
     */
    $hoverDesaturate(value?: string | number | boolean) {
      return getChromaStyleClass({
        value,
        property: "--hover-desaturate",
        class: "ui-hover:ak-state-desaturate-(--hover-desaturate)",
      });
    },
  },
});
