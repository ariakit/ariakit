import { cv } from "clava";
import { active } from "./active.ts";
import {
  control,
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "./control.ts";
import { focus } from "./focus.ts";
import {
  glider,
  gliderAnchor,
  gliderGroup,
  gliderSeparator,
} from "./glider.ts";
import { hover } from "./hover.ts";

export const button = cv({
  extend: [control, gliderAnchor, hover, focus, active],
  class: [
    "transition-[color] not-[a]:cursor-default not-[button]:select-none",
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
     * Sets the button's surface. `bevel` raises it with the gradient and
     * inner shadow of a classic push button, while `flat` paints the layer on
     * its own.
     */
    $kind: {
      flat: "",
      bevel: "ui-bevel-button",
    },
  },
  defaultVariants: {
    $kind: "flat",
    $gapY: "none",
    $hoverOffset: true,
    $focus: true,
    $active: true,
    $lightnessOffset(defaultValue, variants) {
      // A bevel replaces the flat lift with its own gradient plus the
      // explicit lighten below.
      if (variants.$kind === "bevel") return defaultValue ?? false;
      return defaultValue ?? true;
    },
    $lighten(defaultValue, variants) {
      if (variants.$kind !== "bevel") return defaultValue;
      // The gradient alone is subtle on dark surfaces, so the base layer
      // lifts to keep the button distinct from the surface behind it.
      return defaultValue ?? true;
    },
  },
  refine({ variants, setVariants }) {
    if (!variants.$disabled) return;
    // Native buttons suppress these through the :disabled-aware ui-hover and
    // ui-active variants, but label-based controls such as the checkbox card
    // are never :disabled themselves, so drop the state variants here.
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
