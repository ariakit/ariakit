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
} from "./control.ts";
import { focusHighlight } from "./focus.ts";
import { hover } from "./hover.ts";
import { hasLayerBackground, isLayerColor } from "./layer.ts";
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

/**
 * An interactive control with hover, focus, press, selected, and disabled
 * styles.
 */
export const button = cv({
  extend: [control, hover, focusHighlight, active, selected],
  class: [
    "not-[a]:cursor-default not-[button]:select-none",
    // Use a pointer for navigation and form submission; commands keep the
    // arrow.
    "[&:where([type='submit'],form_button:only-of-type,a_&)]:not-ui-disabled:cursor-pointer",
    // Map the 0–100 contrast scale to font weights 500–600.
    "font-[calc(500+var(--contrast))]",
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
     * paints only the layer.
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
      // Neutral bevels use their gradient and explicit lightening. Colored or
      // disabled bevels use the ordinary offset unless $lighten overrides it.
      if (variants.$kind === "bevel") {
        if (hasBevelLighten(variants)) return false;
        return variants.$lighten == null;
      }
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

/** A button label that truncates to one line by default. */
export const buttonLabel = cv({
  extend: [controlLabel],
  defaultVariants: {
    $truncate: true,
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
