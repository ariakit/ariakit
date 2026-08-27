import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
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
    // A wrapping row, so a description placed directly inside the card falls
    // to its own line instead of sitting beside the label.
    "flex-wrap justify-start content-start",
    "[&_input]:sr-only",
    // The check paints itself with the card's edge color. It cannot read
    // --ak-edge directly, because its own layer publishes one.
    "[--checkbox-card-edge:var(--ak-edge)]",
    // Only the hidden input carries the checked and disabled state, never the
    // label around it, so the card's own states come from the -within
    // variants.
    "not-ui-disabled-within:ui-checked-within:ak-edge-brand",
    "not-ui-disabled-within:ui-checked-within:ak-edge-raw",
    "not-ui-disabled-within:ui-checked-within:ak-layer-brand",
    "not-ui-disabled-within:ui-checked-within:ak-layer-mix-20",
    // $lighten below writes an inline style, which no class can override, so
    // the checked layer drops the lift through the plugin's own class.
    "not-ui-disabled-within:ui-checked-within:ak-layer-lighten-0",
  ],
  variants: {
    /**
     * Whether to show a focus ring when the card's input receives keyboard
     * focus, and how thick it should be.
     */
    $focus: {
      // Focus lands on the hidden input, so every step repeats the ring
      // `focus` already draws with the -within trigger. Both maps emit, so
      // keep this scale in step with that one.
      1: "ui-focus-visible-within:outline",
      true: "ui-focus-visible-within:outline-2",
      2: "ui-focus-visible-within:outline-2",
      3: "ui-focus-visible-within:outline-3",
    },
    /**
     * Sets the vertical gap between the element's label and description.
     * @default "card"
     */
    $gapY: {
      // Wrapped rows sit closer together than inline siblings. Defining
      // --gap-y here also reaches the content wrapper, whose gap-y-(--gap-y)
      // is inert without it.
      card: "[--gap-y:calc(var(--py)/2)] gap-y-(--gap-y)",
    },
    /**
     * Sets the element's disabled state. A disabled card keeps a faint edge,
     * because a bordered surface with no border at all reads as a rendering
     * glitch on light layers.
     */
    $disabled: [
      "[--disabled-border:var(--ak-edge)]",
      "ak-edge-5 ak-layer-mix-20",
    ],
  },
  defaultVariants: {
    $rounded: "xl",
    $p: 3,
    $gapY: "card",
    $border: true,
    $focusOffset: 2,
    // Cards are content surfaces: they lift unconditionally instead of
    // taking the adaptive offset, which darkens a card on a light layer.
    $lightnessOffset: false,
    $lighten: true,
  },
});

export const checkboxCardGrid = cv({
  class: [
    "grid auto-rows-fr gap-3",
    "grid-cols-[repeat(auto-fill,minmax(var(--checkbox-card-min-w),1fr))]",
  ],
  variants: {
    /**
     * Sets the narrowest a card may get before the grid drops a column.
     */
    $minItemSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--checkbox-card-min-w": getSpacingValue(value) },
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
    // The icon shows only when the box is checked. Nothing has to un-hide
    // it: the slot is a flex container, so a shown child is blockified
    // anyway.
    "group-not-ui-checked-within/checkbox:*:hidden!",
    // The icon fills two thirds of the circle, which draws the 2.5 stroke at
    // about 1.5px at the default size.
    "[--slot-icon-size:calc(var(--size)/1.5)]",
    "[&>svg]:stroke-[2.5]",
    "group-ui-disabled-within/checkbox:ak-ink-0",
    "group-ui-disabled-within/checkbox:ak-layer-darken-0",
    // A checked circle fills with the card's edge color, so $darken drops
    // the same way $lighten does on the card. The border becomes a ring of
    // that fill color, which keeps the disc one size whichever of the two
    // $borderType picks for the surrounding layer.
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:ak-layer-color-(--checkbox-card-edge)",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:ak-layer-darken-0",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:border-0",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:ring",
    "group-not-ui-disabled-within/checkbox:group-ui-checked-within/checkbox:ring-(--ak-layer)",
  ],
  defaultVariants: {
    $darken: true,
    $border: true,
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
