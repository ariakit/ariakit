import { cv } from "clava";
import {
  getLightnessStyleClass,
  getScaledStyleClass,
} from "../utils/styles.ts";

/**
 * Keeps a selected surface while hovered: the selected offset, or the selected
 * push alone when the offset is unset.
 */
export const selectedHoverClass =
  "ui-selected:ui-hover:ak-state-(--selected-offset,0)";

interface SelectedSurfaceVariants {
  $selectedOffset?: string | number | boolean;
  $selectedPush?: string | number | boolean;
}

/** Whether a selected lightness variant paints a surface. */
function paintsSurface(value?: string | number | boolean) {
  if (value == null) return false;
  if (value === false) return false;
  // Expressions such as `var(--offset)` are not numbers and still paint.
  return Number(value) !== 0;
}

/**
 * Whether the selected offset or push paints a surface. Recipes that paint a
 * selected surface another way add `selectedHoverClass` when this is false.
 */
export function hasSelectedSurface(variants: SelectedSurfaceVariants) {
  if (paintsSurface(variants.$selectedOffset)) return true;
  return paintsSurface(variants.$selectedPush);
}

/**
 * Shared surface effects for checked, selected, and current items. A selected
 * surface stays the same while hovered. Without one, a selected item shows the
 * hover state like the others, such as a current tab marked only by a bar.
 */
export const selected = cv({
  class: "[--selected-offset:initial]",
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
  refine({ variants, addClass }) {
    if (!hasSelectedSurface(variants)) return;
    addClass(selectedHoverClass);
  },
});
