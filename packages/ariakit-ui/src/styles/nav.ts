import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button, buttonSlot } from "./button.ts";
import { frameBase } from "./frame.ts";
import { glider } from "./glider.ts";
import { padding } from "./padding.ts";
import { text } from "./text.ts";

export const nav = cv({
  class: [
    // Groups stack on the root at their own gap, packed at the start: a
    // stretched nav must not spread them. A nav with one list has
    // nothing to space. The marker is what a glider reads the nav through.
    "nav grid content-start gap-(--nav-group-gap)",
    // Gap defaults the variants override through the style attribute.
    "[--nav-gap:--spacing(1)]",
    "[--nav-group-gap:--spacing(4)]",
    // The gap between a row's icon slot and its label, on a disclosure row
    // and on a plain row alike.
    "[--nav-row-gap:--spacing(3)]",
    // A row's padding, and where its content starts past its edge: the
    // control's default padding and its optical side padding on top (see
    // --py and --px in padding.ts). Both are measured in the nav's own line
    // box and font and registered as lengths (see ui.css), so a group
    // label in smaller text pads like a row and insets its text to the same
    // pixel.
    "[--nav-py:--spacing(2)]",
    "[--nav-px:calc(var(--nav-py)+(1lh-1cap)*0.5)]",
    // The box a glider positions against, and a stacking context that keeps
    // the glider's place in the paint order inside the nav.
    "relative isolate",
  ],
  style: {
    // A glider follows the rows through the first three names and finds the
    // guide line beside the row through the others (see navGlider). The scope
    // keeps them to this nav, so a glider never lands in another one.
    anchorScope:
      "--glider-hover, --glider-focus, --glider-selected, --disclosure-guide-hover, --disclosure-guide-focus, --disclosure-guide-selected",
  },
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
     * Sets the space between groups. Numbers scale the spacing token.
     */
    $groupGap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-group-gap": getSpacingValue(value) },
      };
    },
    /**
     * Sets the icon slot size for nav icons and nav disclosures. It must live
     * on the root or an ancestor: the consumers read it as an inherited
     * property or through container style queries, which read the nearest
     * ancestor container. Numbers scale the spacing token.
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
  // Packed at the start: a stretched list keeps its rows together rather than
  // spreading them over the height.
  class: "grid content-start gap-(--nav-gap)",
});

export const navGroup = cv({
  // The label sits one row gap over its list, on the rhythm of the rows.
  class: "grid content-start gap-(--nav-gap)",
});

// The label of a group of rows. It takes the row padding above and below and
// starts its text where a row's content starts. Both lengths come from the nav
// (see --nav-py and --nav-px there): the label's own text is smaller, and the
// em-based spacing step would come out smaller in it.
export const navGroupLabel = cv({
  extend: [padding, text],
  class: ["ak-ink-60 font-medium text-[0.875em] text-start"],
  defaultVariants: {
    // The label pads like a row, with the lengths the nav measured in its own
    // font rather than the label's smaller one.
    $p: "var(--nav-py)",
    $px: "var(--nav-px)",
    $rounded: "md",
  },
});

// The icon slot of a nav row, sized by the nav's icon size. It is a control
// slot, so its outer box is one line square whatever the icon size: that is
// what keeps a wrapping label aligned to it. A standalone nav row, such as a
// brand link, can use it on its own.
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

// Shared row alignment for disclosure buttons and standalone navigation links.
export const navButton = cv({
  class: [
    "justify-start overflow-clip whitespace-normal text-start",
    // Every row keeps the one gap, plus the control's extra side padding
    // that an icon slot takes off, with the nav's default for a row outside
    // a nav, such as a brand row. Important, because a disclosure
    // button spends its own gap channel on the same property.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]!",
  ],
});

export const navButtonContent = cv({
  class: "block overflow-hidden",
});

// A cover takes the box of the row it follows. It is placed from the top: a
// disclosure opening above the row moves the row, and a bottom inset, measured
// from the nav's moving end, would turn that into a travel of its own.
const navGliderCover = cx(
  "inset-s-[anchor(start)] top-[anchor(top)]",
  "w-[anchor-size()] h-[anchor-size()]",
);

// A glider that follows the rows of a nav, wherever they sit: in the nav's own
// list, in a group or in a disclosure. It is the nav's first child, so it
// paints under the rows, which are positioned and come after it, and it can
// travel from one list to another. The rows sit in list items, so the glider's
// own rules, which look for the control right beside it, are replaced by ones
// that look through the nav.
export const navGlider = cv({
  extend: [glider],
  class: [
    // At zero the glider paints over the surface behind the nav and under the
    // rows. A disclosure content paints no surface of its own in a nav (see
    // NavDisclosureContentBody), so a cover shows through it. Two gliders
    // paint in tree order: a later one over an earlier one.
    "z-0",
    // A row a disclosure is still revealing is clipped by the content around
    // it. The glider goes with the row while
    // none of it shows.
    "[position-visibility:anchors-visible]",
    // While a disclosure moves the rows, the nav says
    // so (see Nav), and the glider follows its row at once rather than easing
    // after it.
    "[.nav[data-settling]>&]:transition-none",
  ],
  variants: {
    /**
     * Sets how the glider is drawn. `flat` and `bevel` cover the row they
     * follow, while `bar` is a thin rule beside it, on the side `$side` picks.
     */
    $kind(value?: "flat" | "bevel" | "bar") {
      if (value === "flat") return navGliderCover;
      if (value === "bevel") return ["ui-bevel", navGliderCover];
      if (value !== "bar") return;
      return [
        // The bar reads as an edge on top of the rows, not a surface behind
        // them, so it reverses the stacking the base class sets.
        "z-10",
        // Raw --contrast spans 0-100, so it must be normalized before
        // scaling the bar thickness, or high-contrast mode inflates the bar
        // from 2px to 42px.
        "[--glider-bar:calc(--spacing(0.5)+(--spacing(0.1))*var(--contrast)/100)]",
        "top-[anchor(top)] h-[anchor-size()] w-(--glider-bar)",
      ];
    },
    /**
     * The side a bar sits on. At the `start` it is centred on the guide line of
     * the disclosure content around the row, when there is one, and otherwise
     * it sits on the row's start edge. At the `end` it sits on the row's end
     * edge.
     */
    $side: {
      // The guide is a named anchor the content publishes only while one of its
      // rows is in the glider's state (see $guide in disclosure.ts). With none
      // to find, the fallback puts the bar's centre half a bar past the row's
      // start edge.
      start:
        "inset-s-[calc(anchor(var(--glider-guide)_center,calc(anchor(start)+var(--glider-bar)/2))-var(--glider-bar)/2)]",
      end: "inset-e-[anchor(end)]",
    },
    /**
     * Sets which row state the glider follows. A row publishes the matching
     * anchor name only while it is in that state, so the glider lands on
     * whichever row is hovered, focused, or current right now. A row is the
     * control right inside a list item anywhere in the nav after the glider: a
     * link, or a disclosure button, which a hover or focus glider follows too.
     * Only a link is current.
     */
    $state(value?: "none" | "hover" | "focus" | "selected") {
      // Each state names the guide a bar centres on (see $side). A state
      // without one names a guide nothing publishes, which keeps the bar on the
      // fallback: the dummy the rows carry is a real anchor.
      if (value === "none") return "[--glider-guide:--glider-no-guide]";
      if (value === "hover") {
        return [
          "[position-anchor:--glider-hover] ease-linear",
          "[--glider-guide:--disclosure-guide-hover]",
          "[&~*_li>.control]:ui-hover:[--glider-hover:--glider-hover]",
          // The pointer is crossing the gap between two rows, so the glider
          // waits on the last one for the next instead of leaving at once.
          "[.nav:hover:not(:has(li>.control:hover))>&]:delay-250",
          // With no row under the pointer the anchor is gone, and a glider
          // that stayed would fall to a point at the nav's start. It leaves
          // instead, after the delay above.
          "[.nav:not(:has(li>.control:hover))>&]:hidden",
          // The glider sits behind the row it covers, so the row has to stop
          // painting its own surface or it hides the glider. A disclosure
          // button paints its hover as a gradient, which the second rule
          // takes off.
          "supports-anchor:[&~*_li>.control]:ui-hover:bg-transparent!",
          "supports-anchor:[&~*_li>.control]:ui-hover:bg-none!",
          "supports-anchor:[&~*_li>.control]:ui-hover:border-transparent",
          "supports-anchor:[&~*_li>.control]:ui-hover:befter:hidden",
        ];
      }
      if (value === "focus") {
        return [
          "[position-anchor:--glider-focus] focus",
          "[--glider-guide:--disclosure-guide-focus]",
          "[&~*_li>.control]:ui-focus-visible:[--glider-focus:--glider-focus]",
          // The ring is drawn only while one of the rows has keyboard focus;
          // the row's own ring goes with it.
          "[&:has(~*_li>.control:is(:focus-visible,[data-focus-visible]))]:outline-2",
          "supports-anchor:[&~*_li>.control]:ui-focus-visible:outline-none",
          "ak-outline ak-outline-brand outline-offset-1",
        ];
      }
      if (value === "selected") {
        return [
          "[position-anchor:--glider-selected] selected",
          "[--glider-guide:--disclosure-guide-selected]",
          "[&~*_li>.control]:ui-nav-current:[--glider-selected:--glider-selected]",
          // With no current row there is no anchor to land on, and the glider
          // would stay as a blank square at the nav's start. A current row in
          // a closed disclosure counts as none, from the moment the content
          // starts to close: the glider is outside the content, so it would
          // stay in view while the content folds up.
          "not-[&:has(~*_li>.control:where([aria-current='page'],[aria-current='true']):not(:is([hidden],[data-leave])_*))]:hidden",
        ];
      }
      return;
    },
    /**
     * Animates the glider as it travels between rows.
     */
    $animated(value?: boolean) {
      if (!value) return;
      return "duration-100 transition-discrete";
    },
  },
  defaultVariants: {
    $side(defaultValue, variants) {
      if (variants.$kind !== "bar") return;
      return defaultValue ?? "start";
    },
    // A cover takes the row's own radius; a bar has none (see glider.ts), and
    // keeps none inside a disclosure body, where a nested frame would round its
    // ends to stay concentric.
    $rounded(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      return "md";
    },
    $forceRounded(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? true;
    },
    // A selected cover is the current row's surface: one step off the surface
    // around it, as the row's own is (see navLink), with the row's inset ring.
    $lightnessOffset(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return 1;
    },
    $borderType(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return "inset";
    },
    $border(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return defaultValue ?? true;
    },
  },
  refine({ variants, addClass }) {
    if (variants.$animated) {
      // The insets are the longhands: WebKit passes over the inset-block and
      // inset-inline shorthands in a transition list. Only a hover glider keeps
      // display on the list, so it can wait out its delay before it leaves; a
      // current row's glider leaves at once with a closing disclosure.
      addClass(
        variants.$state === "hover"
          ? "transition-[top,inset-inline-start,inset-inline-end,border-color,height,width,outline,display]"
          : "transition-[top,inset-inline-start,inset-inline-end,border-color,height,width,outline]",
      );
    }
    if (variants.$state !== "selected") return;
    if (variants.$kind === "bar") return;
    // The current row hands its raised surface and its inset ring over to a
    // cover, which draws both (see the defaults above). Beside a bar the row
    // keeps them.
    addClass([
      "supports-anchor:[&~*_li>.control]:ui-nav-current:bg-transparent",
      "supports-anchor:[&~*_li>.control]:ui-nav-current:ring-0",
      "supports-anchor:[&~*_li>.control]:ui-nav-current:befter:hidden",
    ]);
  },
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
