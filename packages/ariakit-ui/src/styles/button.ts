import { cv } from "clava";
import { active } from "./active.ts";
import {
  control,
  controlBar,
  controlContent,
  controlDescription,
  controlGroup,
  controlLabel,
  controlSeparator,
  controlSlot,
  fadesDisabledSurface,
} from "./control.ts";
import { focusHighlight } from "./focus.ts";
import { hover } from "./hover.ts";
import { hasLayerBackground, isLayerColor } from "./layer.ts";
import { segment } from "./segment.ts";
import { selected } from "./selected.ts";

interface BevelLightenVariants {
  $kind?: string;
  $layer?: Parameters<typeof isLayerColor>[0];
  $disabled?: boolean;
}

/** Whether a neutral, enabled bevel needs an explicit lightness increase. */
function hasBevelLighten(variants: BevelLightenVariants) {
  if (variants.$kind !== "bevel") return false;
  // Colored bevels already contrast with their surface; lightening can enter
  // the contrast pipeline's ambiguous range and invert the text.
  if (isLayerColor(variants.$layer)) return false;
  // Disabled bevels lose their gradient, so lightening alone can erase their
  // boundary on light surfaces.
  if (variants.$disabled) return false;
  return true;
}

interface LightnessShiftVariants {
  $lighten?: string | number | boolean;
  $darken?: string | number | boolean;
  $lightnessPush?: string | number | boolean;
}

/**
 * Whether `$lighten`, `$darken`, or `$lightnessPush` moves the layer. `0` and
 * `false` add no class.
 */
function hasLightnessShift(variants: LightnessShiftVariants) {
  if (variants.$lighten) return true;
  if (variants.$darken) return true;
  return !!variants.$lightnessPush;
}

/**
 * An interactive control with hover, focus, press, selected, and disabled
 * styles.
 */
export const button = cv({
  extend: [control, hover, focusHighlight, active, selected, segment],
  class: [
    // Zero specificity lets a plain cursor utility replace the pointer, whatever
    // the order that Tailwind gives the two rules.
    "ui-base:cursor-pointer not-[button]:select-none",
    // Map the 0–100 contrast scale to font weights 500–600. Zero specificity
    // lets a weight class on the button win, whatever its order.
    "ui-base:font-[calc(500+var(--contrast))]",
    // DOM disabled state can change after render. Keep these rules aligned with
    // control.$disabled; the prop also removes hover and press variants.
    "ui-disabled:cursor-not-allowed!",
    "ui-disabled:border-(--disabled-border,transparent)!",
    "ui-disabled:ring-(--disabled-border,transparent)!",
    "ui-disabled:inset-shadow-none! ui-disabled:shadow-none!",
    "ui-disabled:bg-none! ui-disabled:ak-ink-0! ui-disabled:*:ak-ink-0!",
    "ui-disabled:not-forced-colors:ui-text:ak-ink-0!",
    "ui-disabled:forced-colors:text-[GrayText]!",
    "ui-disabled:forced-colors:**:text-[GrayText]!",
    "ui-disabled:forced-colors:border-[GrayText]!",
  ],
  variants: {
    /**
     * Sets the button surface. `bevel` adds a gradient and inner shadow; `flat`
     * paints only the layer. The segmented kinds go inside a group with
     * `$kind="segmented"`, where only the selected button paints.
     */
    $kind: {
      flat: "",
      bevel: "ui-bevel-button",
    },
  },
  defaultVariants: {
    $kind: "flat",
    // Keep the resting surface transparent for the parent; color modifiers can
    // still paint it.
    $layer: "transparent",
    $gapY: "none",
    $hoverOffset: true,
    $hoverInk: 100,
    $focus: true,
    $active: true,
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // An explicit lightness shift replaces the offset. The offset would add
      // to it, and on light surfaces it would darken a lightened button.
      if (hasLightnessShift(variants)) return false;
      // Neutral bevels use their gradient and explicit lightening. Colored or
      // disabled bevels use the ordinary offset.
      if (variants.$kind === "bevel") return !hasBevelLighten(variants);
      if (variants.$layer === "transparent") return false;
      return true;
    },
    $lighten(defaultValue, variants) {
      if (!hasBevelLighten(variants)) return defaultValue;
      // Lighten neutral bevels so the gradient remains distinct on dark
      // surfaces.
      return defaultValue ?? true;
    },
  },
  refine({ variants, setVariants, addClass }) {
    // A bevel needs a forced-colors edge even without a layer background.
    if (
      variants.$kind === "bevel" &&
      variants.$border == null &&
      !hasLayerBackground(variants)
    ) {
      addClass("forced-colors:ak-frame-border");
    }
    // Fade the surface like control does for $disabled. DOM disabled state can
    // change without rerendering the recipe.
    if (fadesDisabledSurface(variants)) {
      addClass("ui-disabled:ak-layer-fade-80");
    }
    if (!variants.$disabled) return;
    // Label-based controls never match :disabled, so remove their hover and
    // press variants explicitly.
    setVariants({
      $hoverOffset: false,
      $hoverPush: false,
      $hoverLighten: false,
      $hoverDarken: false,
      $hoverSaturate: false,
      $hoverDesaturate: false,
      $hoverInk: false,
      $active: false,
    });
  },
});

/**
 * A button label that truncates to one line by default.
 *
 * Set `data-text` to the label text to show the label of a selected, checked,
 * or current control in the button weight while the control uses a lighter
 * weight, as tabs and segments do. The label keeps the width of that heavier
 * text in advance, so the control keeps its size. Directly in a control, the
 * label centers its text in that width unless `$grow` is set. Weight and
 * alignment classes on the label apply in every state. A selected label with
 * `data-text` keeps the button weight over a weight class on the control, so a
 * weight above the button weight goes on the label.
 */
export const buttonLabel = cv({
  extend: [controlLabel],
  class: [
    // Zero specificity lets a weight class on the label win in every state.
    "data-text:group-ui-selected/control:ui-base:font-[calc(500+var(--contrast))]",
    // A zero-height copy of data-text at the selected weight sets the label
    // width, so the control keeps its size when it becomes selected.
    "data-text:before:block data-text:before:h-0 data-text:before:overflow-hidden",
    "data-text:before:invisible data-text:before:content-[attr(data-text)]",
    "data-text:before:font-[calc(500+var(--contrast))]",
  ],
  defaultVariants: {
    $truncate: true,
  },
  refine({ variants, addClass }) {
    // A grown label starts its text in the free space of the control.
    if (variants.$grow) return;
    // In the control row, the text stays in the middle of the reserved width at
    // both weights. A label in a content column keeps the start of the column.
    // Zero specificity lets an alignment class on the label win.
    addClass("[.control>&]:data-text:ui-base:text-center");
  },
});

/** A button description that truncates to one line by default. */
export const buttonDescription = cv({
  extend: [controlDescription],
  defaultVariants: {
    $truncate: true,
  },
});

/** A thin bar inside a button that marks it while checked or current. */
export const buttonBar = controlBar;

/** A button group with shared spacing and optional joined edges. */
export const buttonGroup = controlGroup;

/** A line, slash, or chevron between buttons. */
export const buttonSeparator = controlSeparator;

/** A text-aligned slot for a button icon, avatar, badge, or shortcut. */
export const buttonSlot = controlSlot;

/** A flexible wrapper for a button's label and description. */
export const buttonContent = controlContent;
