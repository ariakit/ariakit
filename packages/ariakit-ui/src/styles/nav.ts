import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button, buttonSlot } from "./button.ts";
import { frameBase } from "./frame.ts";

export const nav = cv({
  class: [
    // Gap default the variant overrides through the style attribute.
    "[--nav-gap:--spacing(1)]",
    // The gap between a row's icon slot and its label, on a disclosure row
    // and on a plain row alike.
    "[--nav-row-gap:--spacing(3)]",
  ],
  variants: {
    /**
     * Sets the space between rows. Numbers scale the spacing token.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-gap": getSpacingValue(value) },
      };
    },
    /**
     * Sets the icon slot size for nav icons and nav disclosures. It must live
     * on the root (or an ancestor such as the sidebar): the consumers read it
     * as an inherited property or through container style queries, which read
     * the nearest ancestor container. Numbers scale the spacing token.
     */
    $iconSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-icon-size": getSpacingValue(value) },
      };
    },
  },
});

export const navList = cv({
  class: "grid gap-(--nav-gap)",
});

export const navGroup = cv({
  class: "grid",
});

// The icon slot of a nav row, sized by the nav's icon size. It is a control
// slot, so its outer box is one line square whatever the icon size: that is
// what keeps a wrapping label aligned to it, and what lets a collapsed row
// centre it with one padding. A standalone nav row, such as a sidebar brand
// link, can use it on its own.
export const navIcon = cv({
  extend: [buttonSlot],
  class: "[--size:var(--nav-icon-size,1em)]",
  defaultVariants: {
    // The size comes from the class above, not from a named step.
    $size: "unset",
  },
});

export const navLink = cv({
  extend: [button],
  class: [
    "justify-start text-wrap",
    "ak-dark:ak-ink-70",
    // Links read as plain rows until they're current.
    "not-ui-nav-current:font-normal",
    "ui-hover:ak-ink-100",
    // The current link holds a raised surface outlined from the inside.
    "ui-nav-current:ak-layer ui-nav-current:ak-layer-5",
    "ui-nav-current:ak-ink-100",
    "ui-nav-current:ak-edge-0",
    "ui-nav-current:ring ui-nav-current:ring-inset",
    // A current link is already lifted, so hovering must not lift it again.
    // The stacked form sorts after the button's own single-variant hover.
    "ui-nav-current:ui-hover:ak-state-0",
    // The row gap plus the control's extra side padding, which an icon slot
    // takes off, so a link with an icon lines up with the disclosure rows
    // around it. $gap is off below, so this is the only gap utility here.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]",
  ],
  defaultVariants: {
    // Idle links sit flush with the surface around them; hover and current
    // still paint their own states.
    $lightnessOffset: false,
    $gap: "none",
  },
});

// The additions layered onto a disclosure button, or onto a plain link such as
// a sidebar brand row, to make it a nav row that collapses with the sidebar.
// Not disclosure-specific, which is why it is not named for one.
export const navButton = cv({
  class: [
    "justify-start overflow-clip whitespace-normal text-start",
    "transition-[gap,width,height,padding] transition-discrete delay-0",
    "duration-(--sidebar-duration)",
    "[interpolate-size:allow-keywords]",
    // Every row keeps the one gap, plus the control's extra side padding
    // that an icon slot takes off, with the nav's default for a row outside
    // a nav, such as a sidebar brand row. Important, because a disclosure
    // button spends its own gap channel on the same property.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]!",
    // Collapsing squares the button around the icon and hides the rest.
    "[--nav-button-size:calc(var(--sidebar-min-width)-(--spacing(2)))]",
    "ui-sidebar-collapsed:size-(--nav-button-size)",
    "ui-sidebar-collapsed:gap-0!",
    // The icon slot's outer box is one line tall and, across, one line less
    // the control's extra side padding twice, which its margins take off.
    // So the square centres it with the block padding below, plus that
    // extra on each side. Padding is in the transition above, and nothing
    // about the icon itself changes, so both directions stay smooth.
    // Important, so the icon keeps equal padding on both sides: a disclosure
    // button spends its start padding on a ps-* longhand, and a longhand
    // sorts after the shorthand.
    "[--nav-button-p:calc((var(--nav-button-size)-1lh)*0.5)]",
    "ui-sidebar-collapsed:py-(--nav-button-p)!",
    "ui-sidebar-collapsed:px-[calc(var(--nav-button-p)+var(--px)-var(--py))]!",
    "ui-sidebar-collapsed:**:data-disclosure-indicator:opacity-0",
  ],
});

// The label collapses along with the sidebar, staging its height and opacity so
// the text fades before the width animates. It pairs with navButton, on a
// disclosure row or a plain link alike.
export const navButtonContent = cv({
  class: [
    "block overflow-hidden transition-[translate,height,opacity]",
    "transition-discrete",
    "[interpolate-size:allow-keywords]",
    "duration-(--sidebar-duration)",
    "delay-[0ms,var(--sidebar-duration),0ms]",
    "ui-sidebar-collapsed:h-lh ui-sidebar-collapsed:opacity-0",
    "ui-sidebar-collapsed:delay-0",
    "ui-sidebar-collapsed:duration-[var(--sidebar-duration),0ms,var(--sidebar-duration)]",
  ],
});

export const navDisclosure = cv({
  class: [
    // Nav icons size the disclosure icon slot when an ancestor sets them.
    "[@container_style(--nav-icon-size)]:[--disclosure-icon-size:var(--nav-icon-size)]",
  ],
  style: {
    // The body indents by the row gap, the same one the button spends. The
    // style attribute is what beats the disclosure root's own gap.
    "--disclosure-gap": "var(--nav-row-gap, calc(var(--spacing) * 3))",
  },
});

export const navDisclosureContent = cv({
  class: ["ui-sidebar-collapsed:h-0 ui-sidebar-collapsed:w-0"],
});

export const navDisclosureContentBody = cv({
  // frameBase, not frame: the body takes the padding and radius and paints
  // nothing, so it must not open a layer of its own.
  extend: [frameBase],
  class: [
    "[--nav-body-padding:calc(var(--nav-gap)*0.5)]",
    "[--nav-body-radius:calc(var(--disclosure-radius)+var(--nav-body-padding))]",
    // The body starts on the row's label. A row's text sits its own control
    // inset past its pill, so each row pulls its pill back by that inset and
    // its text lands on the label, however the lists and groups nest.
    "[&_li>.control]:-ms-(--px)",
  ],
  defaultVariants: {
    $forceRounded: true,
    $rounded: "var(--nav-body-radius)",
    $p: "var(--nav-body-padding)",
  },
});
