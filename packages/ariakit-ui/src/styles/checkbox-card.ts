import { cv } from "clava";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";

export const checkboxCard = cv({
  extend: [button],
  class: [
    "group/checkbox",
    // Like the legacy card, lay content out in a wrapping row so a
    // description placed directly inside the card falls to its own line.
    "flex-wrap justify-start content-start",
    // Wrapped rows sit closer together than inline siblings: the legacy card
    // uses `gap: padding/2 padding*0.75`. Defining --gap-y here also reaches
    // the content wrapper, whose gap-y-(--gap-y) is inert without it.
    "[--gap-y:calc(var(--py)/2)] gap-y-(--gap-y)",
    "[--checkbox-card-edge:var(--ak-edge)]",
    // The disabled state must be detected with the -within variants because
    // only the visually hidden input inside the label carries the disabled
    // attribute, not the label itself.
    "not-ui-disabled-within:ui-checked-within:ak-edge-brand",
    "not-ui-disabled-within:ui-checked-within:ak-edge-raw",
    "ui-focus-visible-within:outline-2 outline-offset-2",
    "not-ui-disabled-within:ui-checked-within:ak-layer-brand",
    "not-ui-disabled-within:ui-checked-within:ak-layer-mix-20",
    "not-ui-disabled-within:ui-checked-within:ak-layer-lighten-0",
    "[&_input]:sr-only",
  ],
  variants: {
    /**
     * Extends the control's disabled wipe: a label-based bordered card must
     * keep a faint edge like the legacy ak-checkbox-card_disabled
     * (ak-edge-5 + ak-layer-mix-20), or it reads as a rendering glitch on
     * light layers.
     */
    $disabled: [
      "[--disabled-border:var(--ak-edge)]",
      "ak-edge-5 ak-layer-mix-20",
    ],
  },
  defaultVariants: {
    $rounded: "xl",
    $p: 3,
    $border: true,
    // Cards are content surfaces: always lighten like the legacy
    // ak-checkbox-card (ak-layer-lighten-6) instead of using the adaptive
    // lightness offset, which darkens the card on light backgrounds.
    $lightnessOffset: false,
    $lighten: 1.2,
  },
});

export const checkboxCardGrid = cv({
  class: [
    "grid auto-rows-fr gap-3",
    "grid-cols-[repeat(auto-fill,minmax(var(--checkbox-card-min-w),1fr))]",
  ],
  variants: {
    $minItemSize(value?: string) {
      if (value == null) return;
      return {
        style: { "--checkbox-card-min-w": value },
      };
    },
  },
  defaultVariants: {
    $minItemSize: "10rem",
  },
});

export const checkboxCardCheck = cv({
  extend: [buttonSlot],
  class: [
    "*:hidden! [&>svg]:stroke-[2.5]",
    // Keep the same icon-to-circle ratio as the legacy check (16px icon in a
    // 24px circle). The 2.5 stroke above renders at ~1.5px at this size,
    // matching the legacy non-scaling 1.5px stroke.
    "[--slot-icon-size:calc(var(--size)/1.5)]",
    "group-ui-disabled-within/checkbox:ak-ink-0",
    "group-ui-disabled-within/checkbox:ak-layer-darken-0",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:ak-layer-color-(--checkbox-card-edge)",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:ak-layer-darken-0",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:ring",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:ring-(--ak-layer)",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:border-0",
    "group-ui-checked-within/checkbox:*:block!",
  ],
  defaultVariants: {
    // 1.2 on the variant scale (0-20 ≈ 0-1 lightness) matches the legacy
    // ak-layer-darken-6 utility (6% on the 0-100 plugin scale).
    $darken: 1.2,
    $border: true,
    $borderType: "auto",
    $rounded: "full",
    $size: "lg",
  },
});

export const checkboxCardSlot = buttonSlot;

export const checkboxCardContent = buttonContent;

export const checkboxCardLabel = cv({
  extend: [buttonLabel],
  class: "grow",
});

export const checkboxCardDescription = buttonDescription;
