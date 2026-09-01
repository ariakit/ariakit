import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button } from "./button.ts";
import { frameBase } from "./frame.ts";

export const nav = cv({
  class: [
    // The marker the nav rows select on to beat the disclosure rules they
    // override. A plain class rather than a flag, so `.nav &` wins on
    // specificity and a consumer installs no custom variant for it.
    "nav",
    // Gap default the variant overrides through the style attribute.
    "[--nav-gap:--spacing(1)]",
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
     * Sets the icon slot size for nav icons and nav disclosures. It must
     * live on the root (or an ancestor such as the sidebar): the consumers
     * are container style queries, which read the nearest ancestor
     * container. Numbers scale the spacing token.
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

// The icon slot is icon-size wide and never shorter than the line, so the
// label lines up with it and the box stays put when the sidebar collapses.
// This is the same box a disclosure row's icon slot takes. A standalone nav
// row, such as a sidebar brand link, can use it on its own.
export const navIcon = cv({
  class: [
    "min-h-lh size-(--nav-icon-size) flex-none self-start",
    "[&_svg]:size-full",
  ],
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
  ],
  defaultVariants: {
    // Idle links sit flush with the surface around them; hover and current
    // still paint their own states.
    $lightnessOffset: false,
  },
});

// The additions layered onto a disclosure button, or onto a plain link such
// as a sidebar brand row, to make it a nav row that collapses with the
// sidebar. Not disclosure-specific, which is why it is not named for one.
export const navButton = cv({
  class: [
    "justify-start overflow-clip whitespace-normal text-start",
    "transition-[gap,width,height,padding] transition-discrete delay-0",
    "duration-(--sidebar-duration)",
    "[interpolate-size:allow-keywords]",
    // The gap tracks the icon optical rhythm. Important because a disclosure
    // button sets its own icon-size gap from a style query, which no variant
    // turns off and which sorts after any plain gap here.
    "gap-[calc(--spacing(3)+1px)]!",
    // Collapsing squares the button around the icon and hides the rest.
    "[--nav-button-size:calc(var(--sidebar-min-width)-(--spacing(2)))]",
    "ui-sidebar-collapsed:size-(--nav-button-size)",
    "ui-sidebar-collapsed:gap-0!",
    // An icon slot is icon-size wide and never shorter than the line, so the
    // square centres it with a different padding per axis. Padding is in the
    // transition above, and nothing about the icon itself changes, so both
    // directions stay smooth.
    "[--nav-button-px:calc((var(--nav-button-size)-var(--nav-icon-size,var(--disclosure-icon-size)))*0.5)]",
    "[--nav-button-py:calc((var(--nav-button-size)-max(1lh,var(--nav-icon-size,var(--disclosure-icon-size))))*0.5)]",
    // Important, so the icon keeps equal padding on both sides: a disclosure
    // button spends its start padding on a ps-* longhand, and a longhand
    // sorts after the px shorthand.
    "ui-sidebar-collapsed:px-(--nav-button-px)!",
    "ui-sidebar-collapsed:py-(--nav-button-py)!",
    "ui-sidebar-collapsed:**:data-disclosure-indicator:opacity-0",
  ],
});

// The label collapses along with the sidebar, staging its height and opacity
// so the text fades before the width animates. It pairs with navButton, on a
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
});

export const navDisclosureContent = cv({
  class: [
    "ui-sidebar-collapsed:h-0 ui-sidebar-collapsed:w-0",
    // Indent past the icon. The style query asks whether the disclosure set
    // an icon slot, and the marker sorts this after the disclosure content's
    // own icon-size indent rule.
    "[.nav_&]:[@container_style(--disclosure-icon-size)]:[--disclosure-ps:calc(var(--disclosure-icon-size)+var(--disclosure-padding)+1px)]",
  ],
});

export const navDisclosureContentBody = cv({
  // frameBase, not frame: the body takes the padding and radius and paints
  // nothing, so it must not open a layer of its own.
  extend: [frameBase],
  class: [
    "[--nav-body-padding:calc(var(--nav-gap)*0.5)]",
    "[--nav-body-radius:calc(var(--disclosure-radius)+var(--nav-body-padding))]",
  ],
  defaultVariants: {
    $forceRounded: true,
    $rounded: "var(--nav-body-radius)",
    $p: "var(--nav-body-padding)",
  },
});
