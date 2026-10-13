import { cv } from "clava";
import {
  getLightnessStyleClass,
  getScaledStyleClass,
} from "../utils/styles.ts";

/** Shared surface effects for checked, selected, and current items. */
export const selected = cv({
  class: [
    "[--selected-offset:initial]",
    // Keep the selected offset during hover, or preserve the resting fill when
    // unset.
    "ui-selected:ui-hover:ak-state-(--selected-offset,0)",
  ],
  variants: {
    /**
     * Sets text strength from `0` to `100` while checked, selected, or current.
     * The value inherits into slots. `false` clears a component default.
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
