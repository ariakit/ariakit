import { cv } from "clava";
import { active } from "./active.ts";
import { aurora } from "./aurora.ts";
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
  extend: [control, gliderAnchor, hover, focus, active, aurora],
  class: [
    "transition-[color] not-[a]:cursor-default not-[button]:select-none",
    // Only apply cursor-pointer to submit buttons that are not disabled
    "[&:where([type='submit'],form_button:only-of-type,a_&)]:not-ui-disabled:cursor-pointer",
    // Adjust the font weight based on the global contrast setting.
    "font-[calc(500+var(--contrast))]",
    // Runtime-disabled buttons (a script toggling :disabled after render,
    // like the admin submit buttons) gray out through the CSS-driven
    // variant, mirroring the $disabled prop's visual classes. The prop
    // remains the render-time source of truth: it also drops the state
    // variants via refine, which CSS cannot. This lives on button, not
    // control, so options keep their deliberately softer disabled look.
    "ui-disabled:cursor-not-allowed! ui-disabled:border-transparent!",
    "ui-disabled:ring-transparent! ui-disabled:inset-shadow-none!",
    "ui-disabled:shadow-none! ui-disabled:bg-none! ui-disabled:ak-ink-0!",
    "ui-disabled:*:ak-ink-0!",
  ],
  variants: {
    $kind: {
      flat: "",
      bevel: "ui-bevel-button",
    },
  },
  defaultVariants: {
    $kind: "flat",
    $gapY: "none",
    $lightnessOffset(defaultValue, variants) {
      if (variants.$kind === "bevel") {
        return defaultValue ?? false;
      }
      return defaultValue ?? true;
    },
    $lighten(defaultValue, variants) {
      if (variants.$kind === "bevel") {
        // The legacy classic button lightens its base layer
        // (ak-layer-lighten-6) so it stands out from the parent layer,
        // especially in dark mode where the bevel gradient alone is subtle.
        return defaultValue ?? 1.2;
      }
      return defaultValue;
    },
    $hoverOffset: true,
    $focus: true,
    $active: true,
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
