import { cv } from "clava";
import {
  getLightnessStyleClass,
  getScaledStyleClass,
} from "../utils/styles.ts";

/** Shared surface effects for checked, selected, and current items. */
export const selected = cv({
  class: [
    // Only offset is read unconditionally below; push supplies its own value.
    "[--selected-offset:initial]",
    // A selected item keeps its own offset when hovered instead of taking
    // the button's hover offset. Without an override, preserve its resting fill.
    "ui-selected:ui-hover:ak-state-(--selected-offset,0)",
  ],
  variants: {
    /**
     * Sets the strength of the element's text while checked, selected, or
     * current, from `0` to `100`, in place of its resting `$ink`. The amount
     * inherits, so the slots of a control follow it. Set to `false` to clear a
     * default set by a component.
     */
    $selectedInk(value?: (string & {}) | number | false) {
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--selected-ink",
        class: "ui-selected:ak-ink-(--selected-ink)",
      });
    },
    /**
     * Sets the maximum lightness shift while checked, selected, or current.
     * Numbers use the same scale as `$hoverOffset`; `true` means one step. The
     * shift decreases as contrast requirements increase.
     */
    $selectedOffset(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--selected-offset",
        class: "ui-selected:ak-state-(--selected-offset)",
      });
    },
    /**
     * Sets the minimum lightness shift while checked, selected, or current.
     * Numbers use the same scale as `$hoverPush`; `true` means one step. The
     * shift increases as contrast requirements increase.
     */
    $selectedPush(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--selected-push",
        class: "ui-selected:ak-state-push-(--selected-push)",
      });
    },
  },
});
