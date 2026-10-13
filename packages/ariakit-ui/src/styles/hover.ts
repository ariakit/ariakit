import { cv } from "clava";
import {
  getChromaStyleClass,
  getLightnessStyleClass,
  getScaledStyleClass,
} from "../utils/styles.ts";

/** Hover adjustments to a layer's text, lightness, and chroma. */
export const hover = cv({
  variants: {
    /**
     * Sets hovered text strength (0–100), replacing `$ink`. The amount inherits
     * through slots and nested layers. `false` clears a component default.
     */
    $hoverInk(value?: (string & {}) | number | false) {
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--hover-ink",
        class: "ui-hover:ak-ink-(--hover-ink)",
      });
    },
    /**
     * Adjusts lightness on hover by a maximum offset. High contrast reduces the
     * offset to protect text contrast; `$invert` increases it. Use `$hoverPush`
     * for a minimum shift.
     */
    $hoverOffset(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--hover-offset",
        class: "ui-hover:ak-state-(--hover-offset)",
      });
    },
    /**
     * Adjusts lightness on hover by a minimum shift. High contrast increases
     * the shift from the parent layer; `$invert` also increases it. Use
     * `$hoverOffset` for a maximum offset.
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
