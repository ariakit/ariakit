import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button } from "./button.ts";

export const nav = cv({
  class: [
    // State flag read by descendants through container style queries, used
    // to deterministically override disclosure rules by stacking variants.
    "[--nav:1]",
    // Gap default the variant overrides with an inline style.
    "[--nav-gap:--spacing(1)]",
  ],
  variants: {
    /**
     * Sets the breathing room between links: it grows the link hit areas
     * while the visible highlight pill stays inset by half of it. Numbers
     * scale the spacing token.
     */
    $gap(value?: (string & {}) | number) {
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
    $iconSize(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--nav-icon-size": getSpacingValue(value) },
      };
    },
  },
});

export const navList = cv({
  class: "grid",
});

export const navGroup = cv({
  class: "grid",
});

// The icon keeps the line height while expanded so the label aligns, and
// squares to the icon size when the sidebar collapses. Standalone nav rows
// (such as a sidebar brand link) consume this directly, like the legacy
// public ak-nav-icon utility.
export const navIcon = cv({
  class: [
    "h-[1lh] w-(--nav-icon-size) flex-none self-start transition-[height]",
    "[&_svg]:size-full",
    "ui-sidebar-collapsed:size-(--nav-icon-size)",
  ],
});

export const navLink = cv({
  extend: [button],
  class: [
    "z-1 justify-start text-wrap",
    "ak-dark:ak-ink-70",
    // Links read as plain rows until they're current.
    "not-ui-nav-current:font-normal",
    // The block padding absorbs the nav gap so hit areas touch; pt/pb sort
    // after the control's py shorthand, so the longhands win.
    "[--nav-link-py:calc(var(--disclosure-padding,var(--ak-frame-padding))-(1lh-1em)/2+var(--nav-gap))]",
    "pt-(--nav-link-py) pb-(--nav-link-py)",
    // The visible highlight is a pill drawn by the ::before pseudo, inset
    // by half the nav gap while the link box keeps the full hit area. It
    // paints the element's own state-adjusted layer color, so the element
    // itself goes transparent for the pill to read as the surface.
    // Hovering paints the pill unless the link is current.
    "ui-hover:not-ui-nav-current:bg-transparent",
    "ui-hover:not-ui-nav-current:before:content-['']",
    "ui-hover:not-ui-nav-current:before:absolute",
    "ui-hover:not-ui-nav-current:before:-z-1",
    "ui-hover:not-ui-nav-current:before:inset-x-0",
    "ui-hover:not-ui-nav-current:before:[inset-block:calc(var(--nav-gap)*0.5)]",
    "ui-hover:not-ui-nav-current:before:rounded-[inherit]",
    "ui-hover:not-ui-nav-current:before:ak-layer",
    "ui-hover:not-ui-nav-current:before:ak-layer-color-(--ak-layer)",
    "ui-hover:ak-ink-100",
    // The current link holds a raised pill with an inset ring.
    "ui-nav-current:bg-transparent",
    "ui-nav-current:before:content-['']",
    "ui-nav-current:before:absolute",
    "ui-nav-current:before:-z-1",
    "ui-nav-current:before:inset-x-0",
    "ui-nav-current:before:[inset-block:calc(var(--nav-gap)*0.5)]",
    "ui-nav-current:before:rounded-[inherit]",
    "ui-nav-current:before:ak-layer",
    "ui-nav-current:before:ak-layer-color-(--ak-layer)",
    "ui-nav-current:ak-layer ui-nav-current:ak-layer-6",
    "ui-nav-current:ak-ink-100",
    "ui-nav-current:before:ak-edge-0",
    "ui-nav-current:before:ring ui-nav-current:before:ring-inset",
    // The stacked form suppresses the hover state paint on current links;
    // it sorts after the single-variant hover state above.
    "ui-nav-current:ui-hover:ak-state-0",
  ],
  defaultVariants: {
    // Idle links sit flush with the surface like the legacy trailing
    // ak-layer; hover and current still paint their own states.
    $lightnessOffset: false,
  },
});

// The additions layered onto a disclosure button (or a plain link) to make
// it a nav row that collapses with the sidebar.
export const navButton = cv({
  class: [
    "justify-start overflow-clip whitespace-normal text-start",
    "transition-[gap,width,height,padding] transition-discrete delay-0",
    "[transition-duration:var(--sidebar-duration)]",
    "[interpolate-size:allow-keywords]",
    // The gap tracks the icon optical rhythm; both forms are needed so it
    // deterministically beats the control gap and the disclosure's
    // icon-size gap by variant stacking.
    "ui-nav:gap-[calc(0.75em+1px)]",
    "ui-nav:[@container_style(--disclosure-icon-size)]:gap-[calc(0.75em+1px)]",
    // Collapsing squares the button around the icon and hides the rest.
    "[--nav-button-size:calc(var(--sidebar-min-width)_-_--spacing(2))]",
    "ui-sidebar-collapsed:size-(--nav-button-size)",
    "ui-nav:ui-sidebar-collapsed:gap-0",
    "ui-nav:ui-sidebar-collapsed:[@container_style(--disclosure-icon-size)]:gap-0",
    "[--nav-button-p:calc((var(--nav-button-size)-var(--nav-icon-size,var(--disclosure-icon-size)))*0.5)]",
    // The shorthand sorts after every plain padding rule on the button,
    // like the legacy single padding declaration.
    "ui-sidebar-collapsed:p-(--nav-button-p)",
    "ui-sidebar-collapsed:[&_[data-disclosure-indicator]]:opacity-0",
  ],
});

// The label collapses along with the sidebar, staging its height and
// opacity transitions so the text fades before the width animates.
export const navButtonContent = cv({
  class: [
    "block overflow-hidden transition-[translate,height,opacity]",
    "[transition-behavior:allow-discrete]",
    "[interpolate-size:allow-keywords]",
    "[transition-duration:var(--sidebar-duration)]",
    "[transition-delay:0ms,var(--sidebar-duration),0ms]",
    "ui-sidebar-collapsed:h-[1lh] ui-sidebar-collapsed:opacity-0",
    "ui-sidebar-collapsed:delay-0",
    "ui-sidebar-collapsed:[transition-duration:var(--sidebar-duration),0ms,var(--sidebar-duration)]",
  ],
});

export const navDisclosure = cv({
  class: [
    // Legacy ak-frame-field/2: field radius with control-sized padding.
    "ak-frame ak-frame-(--radius-field) ak-frame-p-2",
    // Nav icons size the disclosure icon slot when an ancestor sets them.
    "[@container_style(--nav-icon-size)]:[--disclosure-icon-size:var(--nav-icon-size)]",
  ],
});

export const navDisclosureContent = cv({
  class: [
    "ui-sidebar-collapsed:h-0 ui-sidebar-collapsed:w-0",
    // Indent past the icon; the ui-nav stacking sorts this after the
    // disclosure content's own icon-size indent rule.
    "ui-nav:[@container_style(--disclosure-icon-size)]:[--disclosure-ps:calc(var(--disclosure-icon-size)+var(--disclosure-padding)+1px)]",
  ],
});

export const navDisclosureContentBody = cv({
  class: [
    "[--nav-body-padding:calc(var(--nav-gap)*0.5)]",
    "[--nav-body-radius:calc(var(--disclosure-radius)+var(--nav-body-padding))]",
    "ak-frame ak-frame-force ak-frame-(--nav-body-radius)",
    "ak-frame-p-(--nav-body-padding)",
    // The ui-nav stacking sorts this after the disclosure body's own
    // padding-inline-start rule.
    "ui-nav:[padding-inline-start:var(--disclosure-ps)]",
  ],
});
