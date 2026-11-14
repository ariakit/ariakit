import { cv, cx } from "clava";
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
 * The classes of a viewport without a fade. The buttons cover the content, and
 * the content keeps its place under them. With snapping, a button space would
 * also move the snap points, so the viewport drops it.
 */
export const carouselNoFadeClass = cx(
  "[--carousel-fade-size:0px]",
  "[--carousel-button-space:0px]",
);

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
  class: [
    "carousel",
    // The first grid cell holds the viewport and both buttons. Let the root
    // shrink in flex and grid layouts so the viewport can scroll.
    "grid min-w-0 grid-cols-[minmax(0,1fr)]",
    // Keep the z-index of the buttons inside. Zero specificity lets an
    // extender, such as a tab strip, stack its parts with the elements around
    // it instead.
    "ui-base:isolate",
    // The buttons follow the scroll timeline of the viewport, their sibling.
    "[timeline-scope:--carousel]",
    "[--carousel-button-size:--spacing(8)]",
    // The space between each button and the end of the row, and the same
    // space on the other side of the button, where it also takes the pointer.
    // Zero specificity lets an extender, such as a tab strip, set its own.
    "ui-base:[--carousel-button-padding:--spacing(2)]",
    // The ui-tabs-open-* utilities repeat this size, because a tab panel can't
    // read it from the strip.
    "[--carousel-fade-size:--spacing(8)]",
    // The space that a visible button takes at each end. It stays zero until
    // $buttons sets it.
    "[--carousel-button-space:0px]",
    // A row of controls, such as a segmented group, fits its buttons to the
    // line and the block padding of its controls, so the buttons keep the same
    // space from the edge of the row on every side. A border on the controls,
    // which segments draw on a dark surface, adds 1px above and below. The size
    // follows the text of the row, so controls with a text size of their own
    // need the row to take it too. Whole and even pixels keep the icons on the
    // pixel grid.
    "has-[>.carousel-frame]:[--carousel-button-padding:round(--spacing(1),1px)]",
    "has-[>.carousel-frame]:[--carousel-button-size:round(calc(1lh+1em-2*var(--carousel-button-padding)),2px)]",
  ],
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
      pointer: [
        // Row buttons hide, and with a fine pointer, scroll-driven animations
        // show them while the viewport can scroll toward their side, and grow
        // them in.
        "[--carousel-button-visibility:hidden]",
        "any-pointer-fine:[--carousel-button-start-animation:ui-carousel-show-start,ui-carousel-grow-start]",
        "any-pointer-fine:[--carousel-button-end-animation:ui-carousel-show-end,ui-carousel-grow-end]",
        // The buttons show only with scroll-driven animations, so the space
        // needs them too.
        "has-[>.carousel-button-area]:supports-[animation-timeline:scroll()]:any-pointer-fine:[--carousel-button-space:calc(var(--carousel-button-size)+var(--carousel-button-padding))]",
      ],
      always: [
        // Reset the values that a row around this carousel sets.
        "[--carousel-button-visibility:visible]",
        "[--carousel-button-start-animation:none] [--carousel-button-end-animation:none]",
        "has-[>.carousel-button-area]:[--carousel-button-space:calc(var(--carousel-button-size)+var(--carousel-button-padding))]",
      ],
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
      true: "carousel-fade ui-carousel-fade",
      false: carouselNoFadeClass,
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
  class: [
    "carousel-viewport",
    "row-start-1 col-start-1",
    "flex min-w-0",
    "overflow-x-auto overflow-y-clip overscroll-x-contain scrollbar-none",
    "[scroll-timeline:--carousel_inline]",
    // Zero specificity lets a gap class win, though slides size with $gap.
    "ui-base:gap-(--carousel-gap)",
    // Reach past the root by the bleed of the root, with the same padding, so
    // the items stay in place and keep room for focus rings.
    "-m-(--carousel-overhang,0px) p-(--carousel-overhang,0px)",
    // The part of each end that the fade and the button cover, or the space
    // that the fade keeps clear without a button, if it's larger.
    "[--carousel-inset:calc(var(--carousel-overhang,0px)+max(var(--carousel-button-space),var(--carousel-clear))+var(--carousel-fade-size))]",
    "scroll-px-(--carousel-inset)",
  ],
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
      proximity: "snap-x snap-proximity",
      mandatory: "snap-x snap-mandatory",
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
  class: [
    "carousel-button-area",
    // Containers can raise the buttons above other layers of the first cell.
    "row-start-1 col-start-1 z-(--carousel-button-z,1) self-stretch",
    // The padding goes only on the sides, so the area spans the viewport with
    // its bleed.
    "py-0 -my-(--carousel-overhang,0px)",
    // The hit area of the button reaches far above and below it, and the area
    // cuts it at its own edges. A size container could size it instead, but
    // container queries in nested grids can stop Chromium for seconds on each
    // layout.
    "overflow-y-clip",
    // The area paints nothing, and its radius only keeps the button concentric.
    // Firefox would clip the hit area to its rounded corners.
    "rounded-none!",
    "flex justify-center [align-items:var(--carousel-button-align,center)]",
    "pointer-events-none",
  ],
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
    "carousel-button",
    "pointer-events-auto size-(--carousel-button-size) shrink-0 items-center",
    "shadow-md [&>svg]:size-[1em]",
    // A row button grows in from its middle, and the press scales it there too.
    "origin-center",
    // The area centers the button, or aligns it as the root sets, and this
    // moves it down from there, as $buttonCenter does.
    "top-(--carousel-button-y,0px)",
    // The hit area, which the area cuts at its top and bottom. Side offsets
    // start inside the border, if there's one.
    "before:absolute before:-inset-y-[100vh]",
    "before:-inset-x-[calc(var(--carousel-button-padding)+var(--control-border,0px))]",
    // A disabled button can lie over the content, so it keeps its color and
    // lets the content show through, instead of fading toward the color
    // around the carousel.
    "ui-disabled:ak-layer-fade-0! ui-disabled:opacity-50",
    // Chevrons point to the start or the end in either writing direction.
    "rtl:[&_svg]:-scale-x-100",
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
  class: [
    "carousel-slide",
    "min-w-0 shrink-0 grow-0 ui-base:basis-full snap-start",
  ],
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
  class: "flex flex-wrap justify-center",
});

/** A dot that picks its slide. */
export const carouselTab = cv({
  extend: [button],
  class: [
    "carousel-tab",
    "size-6 items-center justify-center",
    "before:size-2 before:rounded-full before:bg-current before:opacity-40",
    "before:transition-[width,opacity] motion-reduce:before:transition-none",
    "ui-selected:before:w-4 ui-selected:before:opacity-100",
  ],
  defaultVariants: {
    $rounded: "full",
    $p: "none",
    $selectedOffset: false,
  },
});
