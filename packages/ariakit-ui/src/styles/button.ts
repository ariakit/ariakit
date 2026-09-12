import { cv } from "clava";
import { active } from "./active.ts";
import {
  control,
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "./control.ts";
import { focusHighlight } from "./focus.ts";
import {
  glider,
  gliderAnchor,
  gliderGroup,
  gliderSeparator,
} from "./glider.ts";
import { hover } from "./hover.ts";
import { isLayerColor } from "./layer.ts";

interface BevelLightenVariants {
  $kind?: string;
  $layer?: Parameters<typeof isLayerColor>[0];
  $disabled?: boolean;
}

/**
 * Whether a bevel lifts its base layer through the explicit lighten instead of
 * the flat lift. Only a bevel in the surface's own color does.
 */
function hasBevelLighten(variants: BevelLightenVariants) {
  if (variants.$kind !== "bevel") return false;
  // A color of its own already separates the bevel from the surface. A fixed
  // lighten on a mid-lightness color can land in the contrast pipeline's
  // ambiguous midrange, which moves it far past the step and flips the ink.
  if (isLayerColor(variants.$layer)) return false;
  // The disabled look wipes the gradient, and on a light surface the lighten
  // alone lands on white, where the box disappears.
  if (variants.$disabled) return false;
  return true;
}

export const button = cv({
  extend: [control, gliderAnchor, hover, focusHighlight, active],
  class: [
    "not-[a]:cursor-default not-[button]:select-none",
    // A pointer cursor promises navigation or submission, so only a submit
    // button, a form's lone button, and a button inside a link opt in.
    // Everything else is a command and keeps the arrow.
    "[&:where([type='submit'],form_button:only-of-type,a_&)]:not-ui-disabled:cursor-pointer",
    // --contrast runs 0-100, so the weight runs 500 to 600 with it.
    "font-[calc(500+var(--contrast))]",
    // A script can flip :disabled after render, so the disabled look also has
    // to exist as a CSS rule. These mirror control's $disabled classes and
    // have to stay in step with them. The prop remains the render-time source
    // of truth: it additionally drops the hover and active variants, which
    // CSS cannot do.
    "ui-disabled:cursor-not-allowed!",
    "ui-disabled:border-(--disabled-border,transparent)!",
    "ui-disabled:ring-(--disabled-border,transparent)!",
    "ui-disabled:inset-shadow-none! ui-disabled:shadow-none!",
    "ui-disabled:bg-none! ui-disabled:ak-ink-0! ui-disabled:*:ak-ink-0!",
  ],
  variants: {
    /**
     * Sets the button's surface. `bevel` raises it with the gradient and inner
     * shadow of a classic push button, while `flat` paints the layer on its
     * own.
     */
    $kind: {
      flat: "",
      bevel: "ui-bevel-button",
    },
  },
  defaultVariants: {
    $kind: "flat",
    // A button opens a layer for its content and its states rather than to
    // paint a surface of its own, so it shows the surface behind it until
    // hovered, and a glider can travel behind it. A layer of its own, or a
    // lift, paints it at rest.
    $layer: "transparent",
    $gapY: "none",
    $hoverOffset: true,
    $focus: true,
    $active: true,
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A bevel paints a surface even on the see-through layer. In the
      // surface's own color, it lifts through its gradient plus the explicit
      // lighten below. With a color of its own, it takes the flat lift, so both
      // kinds paint the same color. Disabled, it loses the gradient and takes
      // the flat lift too, which stays visible in both color schemes. A lighten
      // passed along with either replaces the flat lift.
      if (variants.$kind === "bevel") {
        if (hasBevelLighten(variants)) return false;
        return variants.$lighten == null;
      }
      // A see-through button has nothing to lift off. A button with a layer of
      // its own lifts off the surface around it.
      if (variants.$layer === "transparent") return false;
      return true;
    },
    $lighten(defaultValue, variants) {
      if (!hasBevelLighten(variants)) return defaultValue;
      // The gradient alone is subtle on dark surfaces, so the base layer lifts
      // to keep the button distinct from the surface behind it.
      return defaultValue ?? true;
    },
  },
  refine({ variants, setVariants }) {
    if (!variants.$disabled) return;
    // Native buttons suppress these through the :disabled-aware ui-hover and
    // ui-active variants, but label-based controls such as the choice card are
    // never :disabled themselves, so drop the state variants here.
    setVariants({
      $hoverOffset: false,
      $hoverPush: false,
      $hoverLighten: false,
      $hoverDarken: false,
      $hoverSaturate: false,
      $hoverDesaturate: false,
      $active: false,
    });
  },
});

export const buttonLabel = cv({
  extend: [controlLabel],
  defaultVariants: {
    $truncate: true,
  },
});

export const buttonDescription = cv({
  extend: [controlDescription],
  defaultVariants: {
    $truncate: true,
  },
});

export const buttonGlider = glider;

export const buttonGroup = gliderGroup;

export const buttonSeparator = gliderSeparator;

export const buttonSlot = controlSlot;

export const buttonContent = controlContent;
