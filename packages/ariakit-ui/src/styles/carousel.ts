import { cv } from "clava";
import { getPaddingValue, getSpacingValue } from "../utils/styles.ts";
import { button } from "./button.ts";
import { frame, frameBase } from "./frame.ts";
import { isLayerColor } from "./layer.ts";
import { text } from "./text.ts";

/**
 * The classes of the `$step` values, which the script of the carousel buttons
 * reads. `view`, the default, adds nothing, and the script uses the visible
 * width of the row.
 */
export const carouselStepClasses = {
  view: "",
  item: "[--carousel-step:item]",
};

/**
 * A horizontal carousel root that holds the viewport, the buttons beside it,
 * and anything below them, such as slide tabs. `$kind="row"` suits chips,
 * thumbnails, and cards that scroll freely, with buttons shown only with a fine
 * pointer. `$kind="slides"`, the default, suits a classic carousel, with
 * buttons on every device. Only style components add carousel semantics; these
 * classes add none.
 *
 * The root paints nothing by default. A viewport that fades its content would
 * fade its own surface too, so the root can paint that surface instead, with
 * frame variants such as `$layer`, `$rounded`, and `$border`. Set `$frame` for
 * its padding and corners.
 */
export const carousel = cv({
  extend: [frame, text],
  class: "ui-carousel",
  variants: {
    /**
     * Sets `row` for content that scrolls freely, or `slides` for a classic
     * carousel. It's a preset for `$buttons`, and the viewport takes the same
     * kind for its own presets. Slides keep space between the viewport and the
     * slide tabs, which a `gap-y-*` class on the root replaces.
     */
    $kind: {
      row: "",
      // Zero specificity lets a gap class on the root win.
      slides: "ui-base:gap-y-3",
    },
    /**
     * Sets when the buttons show: `pointer` only with a fine pointer and while
     * the viewport can scroll toward their side, or `always` on every device.
     * The buttons read it through custom properties.
     */
    $buttons: {
      pointer: "ui-carousel--buttons-pointer",
      always: "ui-carousel--buttons-always",
    },
    /**
     * Sets how far the viewport reaches past the root on each side, with the
     * same padding inside it, so its items stay in place. The viewport clips
     * its content on both axes, so this is the room for focus rings, borders
     * drawn as rings, and items that grow on hover. Numbers multiply the
     * spacing token and round to a whole pixel. Defaults to `1` for a row and
     * `0` for slides.
     */
    $bleed(value?: string | number) {
      if (value == null) return;
      return { style: { "--carousel-overhang": getPaddingValue(value) } };
    },
    /**
     * Sets the distance from the top of the row to the center of the buttons,
     * as a length, such as the middle of a row of thumbnails with titles below
     * them. The row is the viewport without its bleed. Defaults to the middle
     * of the row.
     */
    $buttonCenter(value?: string) {
      if (value == null) return;
      // The button area starts at the top of the bleed.
      const top = `calc(var(--carousel-overhang) + ${value} - var(--carousel-button-size) / 2)`;
      return {
        style: {
          "--carousel-button-align": "start",
          "--carousel-button-y": top,
        },
      };
    },
    /**
     * Sets the size of the buttons, and so the space that each button takes at
     * its end. Numbers multiply the spacing token and round to a whole pixel;
     * strings pass through as raw lengths or expressions. Defaults to `8`, or
     * to the line of a row of controls, which this replaces.
     */
    $buttonSize(value?: string | number) {
      if (value == null) return;
      return { style: { "--carousel-button-size": getPaddingValue(value) } };
    },
  },
  defaultVariants: {
    // The root takes no frame geometry and no layer until a surface needs them,
    // so the frames inside it keep the corners of the frames around it.
    $frame: false,
    $layer: false,
    $kind: "slides",
    $buttons(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      return variants.$kind === "row" ? "pointer" : "always";
    },
    $bleed(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      return variants.$kind === "row" ? 1 : 0;
    },
  },
});

/**
 * The variants that every carousel viewport style recipe supplies, so that
 * `CarouselViewport` can take another style recipe, such as a tab strip.
 */
export const carouselViewportBase = cv({
  variants: {
    /**
     * Fades each end while more content lies that way. While a button shows,
     * the content is fully faded behind it. Without scroll-driven animations,
     * nothing fades.
     */
    $fade: {
      true: "ui-carousel-faded ui-carousel-fade",
      false: "ui-carousel-no-fade",
    },
    /**
     * Sets how far a row button scrolls: `view`, the default, scrolls by the
     * visible width less the fades and buttons, and `item` scrolls to the next
     * item, skipping items closer than the fade and button cover. A step that
     * would leave less than they cover goes on to the end. Slide buttons move
     * one slide at a time.
     */
    $step: carouselStepClasses,
  },
});

/**
 * The scrolling part of a carousel, in the first cell of the root, under the
 * buttons. It hides its scrollbar, and its scroll-padding keeps focused items
 * clear of the fades and the buttons.
 */
export const carouselViewport = cv({
  extend: [carouselViewportBase],
  class: "ui-carousel-viewport",
  variants: {
    /**
     * Sets `row` or `slides`, like the root. It's a preset for `$snap`,
     * `$fade`, and `$gap`. Slides keep clear of the fades and buttons, so each
     * page shows whole slides between them.
     */
    $kind: {
      row: "",
      slides: "px-(--carousel-inset)",
    },
    /**
     * Snaps the viewport to its items. `mandatory` always stops on an item,
     * `proximity` stops near one, and `none` scrolls freely. Slides snap where
     * their pages start.
     */
    $snap: {
      none: "",
      proximity: "ui-carousel-viewport--snap-proximity",
      mandatory: "ui-carousel-viewport--snap-mandatory",
    },
    /**
     * Sets the space between items. Numbers multiply the spacing token. Slides
     * use it to share the row, so set it instead of a gap class on slides.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return { style: { "--carousel-gap": getSpacingValue(value) } };
    },
  },
  defaultVariants: {
    $kind: "slides",
    $snap(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      return variants.$kind === "row" ? "none" : "mandatory";
    },
    // The map's false key makes false the static default, so only a row
    // replaces it.
    $fade(defaultValue, variants) {
      if (defaultValue !== false) return defaultValue;
      return variants.$kind === "row";
    },
    $gap(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      return variants.$kind === "row" ? 2 : 3;
    },
  },
});

/**
 * A frame at one end of a carousel row that holds a `carouselButton`, with its
 * `$p`, `--carousel-button-padding` from the root, on each side of the button.
 * It spans the height of the viewport, bleed included, and clips the hit area
 * of the button to that height. The frame paints nothing and takes no pointer
 * itself, so the content under it stays reachable while its button hides. The
 * button keeps its corners concentric with the frames around the carousel, less
 * this padding.
 */
export const carouselButtonArea = cv({
  extend: [frameBase],
  class: "ui-carousel-button-area",
  variants: {
    /** Sets the side the area sits on. */
    $side: {
      start: "justify-self-start",
      end: "justify-self-end",
    },
  },
  defaultVariants: {
    $side: "end",
    $p: "var(--carousel-button-padding)",
    // The radius passes to the button, less the padding. Without a frame around
    // the carousel, the button stays round.
    $rounded: "full",
  },
});

/**
 * A round button that scrolls a carousel toward its side, in a
 * `carouselButtonArea`. Its hit area spans the height of the area, with the
 * padding of the area on each side, so the pointer finds the button there and
 * not the content under it. It stacks above the viewport, whose fade mask
 * paints it in a layer of its own. It shows as the `$buttons` variant of the
 * root sets.
 */
export const carouselButton = cv({
  extend: [button],
  class: [
    "ui-carousel-button shadow-md",
    // A row button grows in from its middle, and the press scales it there too.
    // Stays a class to come after the transform-origin of `active`, which it
    // replaces.
    "origin-center",
  ],
  variants: {
    /** Sets the side the button scrolls toward. */
    $side: {
      start: "ui-carousel-button-start",
      end: "ui-carousel-button-end",
    },
  },
  defaultVariants: {
    $side: "end",
    // A neutral button lightens from the color around the carousel. A layer
    // color keeps the button offset, because lightening a saturated color can
    // flip its text.
    $lighten(defaultValue, variants) {
      if (isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? true;
    },
    $border: true,
    $rounded: "full",
    $p: "none",
  },
});

/**
 * A slide that fills the visible row and snaps to its start. Zero specificity
 * lets a `basis-*` class show more slides at once, such as half the row less
 * half the gap for two slides.
 */
export const carouselSlide = cv({
  class: "ui-carousel-slide",
  variants: {
    /**
     * Sets whether a fast swipe, such as a flick on a touch screen or a
     * trackpad, stops at the slide (`always`, the default), as the slide
     * buttons move one slide at a time, or can pass it (`normal`, the default
     * of browsers). Some browsers, such as Firefox, also stop a long wheel
     * scroll at the slide. The buttons and the slide tabs still go to any
     * slide.
     */
    $snapStop: {
      normal: "snap-normal",
      always: "snap-always",
    },
  },
  defaultVariants: {
    $snapStop: "always",
  },
});

/** A row of slide tabs below the viewport. */
export const carouselTabList = cv({
  class: "ui-carousel-tab-list flex-wrap",
});

/** A dot that picks its slide. */
export const carouselTab = cv({
  extend: [button],
  class: [
    "ui-carousel-tab",
    // Stays a class to come after the classes of a caller, so that the reduced
    // motion rule still applies.
    "motion-reduce:before:transition-none",
  ],
  defaultVariants: {
    $rounded: "full",
    $p: "none",
    $selectedOffset: false,
  },
});
