import { cv } from "clava";
import { getScaledStyleClass } from "../utils/styles.ts";

/**
 * Text strength. `layer` and `text` extend it, so an element with both style
 * recipes sets the strength only once.
 */
export const ink = cv({
  variants: {
    /**
     * Sets text strength from `0` (minimum readable contrast) to `100` (full
     * strength). The amount inherits through nested layers. Text with an
     * adaptive `$text` color keeps that color at full strength. `false` clears
     * a component default.
     */
    $ink(value?: (string & {}) | number | false) {
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--ink",
        class: "ak-ink-(--ink)",
      });
    },
  },
});
