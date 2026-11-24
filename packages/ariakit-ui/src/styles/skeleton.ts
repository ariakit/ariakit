import { cv, cx } from "clava";
import { frame } from "./frame.ts";

const WEIGHT_STEPS = { light: 1, normal: 2, medium: 4, bold: 6 } as const;

/**
 * The loading area. It owns the animation, so all parts inside it move in step.
 * Parts outside a root never animate.
 */
export const skeleton = cv({
  class: "ui-skeleton",
  variants: {
    /**
     * Sets the animation of the parts. `shimmer` moves a highlight across each
     * part and falls back to `pulse` with reduced motion. `pulse` fades the
     * whole area.
     */
    $animate: {
      shimmer: "ui-skeleton--animate-shimmer motion-reduce:animate-pulse",
      pulse: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    $animate: "shimmer",
  },
});

const shimmerInsetEdge = cx(
  "ui-skeleton-shimmer-inset-edge",
  // Stays a class to come after the --tw-ring-shadow of `frameBase`, which it
  // replaces.
  "ui-skeleton-shimmer:ring-0",
);

/** Shared tint, edge, and highlight for every skeleton part. */
const skeletonBase = cv({
  extend: [frame],
  class: "ui-skeleton-base",
  variants: {
    /** Sets the tint strength against the parent surface. */
    $weight: { light: "", normal: "", medium: "", bold: "" },
    /** Sets the edge type; forced colors use an outline instead. */
    $borderType: {
      // The outline supplies the forced-colors edge without a real border that
      // would change the size.
      inset: "forced-colors:ak-frame-border-0!",
    },
  },
  defaultVariants: {
    $weight: "normal",
    $p: "none",
    $border: true,
    // The edge grows with the contrast preference, so parts stay visible when a
    // lighter tint would disappear.
    $edgeWeight: "adaptive",
    $borderType(defaultValue) {
      // The frame resolves an unset border type to `auto`.
      if (defaultValue === undefined) return "inset";
      if (defaultValue === "auto") return "inset";
      return defaultValue;
    },
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) {
        return defaultValue;
      }
      if (variants.$weight == null) {
        return WEIGHT_STEPS.normal;
      }
      return WEIGHT_STEPS[variants.$weight];
    },
  },
});

/** A rectangular placeholder, such as for an image or a card. */
export const skeletonBox = cv({
  extend: [skeletonBase],
  class: [
    "ui-skeleton-box ui-skeleton-shimmer-before",
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:outline",
  ],
  variants: {
    $borderType: { inset: shimmerInsetEdge },
  },
  defaultVariants: {
    $rounded: "md",
  },
});

/** A round placeholder, such as for an avatar. */
export const skeletonCircle = cv({
  extend: [skeletonBase],
  class: [
    "ui-skeleton-circle ui-skeleton-shimmer-before",
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:outline",
  ],
  variants: {
    $borderType: { inset: shimmerInsetEdge },
  },
  defaultVariants: {
    $rounded: "full",
    // Stay round inside padded frames, which would otherwise reduce the radius
    // to follow their corners.
    $forceRounded: true,
  },
});

/**
 * A placeholder for one line of text. It takes the height of one line box and
 * paints a bar about as tall as the letters with ascenders and descenders, so
 * text that replaces it does not move the layout.
 */
export const skeletonLine = cv({
  extend: [skeletonBase],
  class: [
    "ui-skeleton-line",
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:before:outline",
  ],
  defaultVariants: {
    // About a quarter of the bar height.
    $rounded: "sm",
    // A bar never sits in the corner of its container, so it keeps its radius
    // inside frames with tight corners, such as table rows.
    $forceRounded: true,
    // The bar draws its own ring.
    $borderType: "unset",
    // Lines draw no edge. They push their tint away from the surface instead,
    // and the push grows with the contrast preference, so a thin bar stays
    // visible in high contrast without an outline around it.
    $border: false,
    $lightnessOffset: false,
    $lightnessPush(defaultValue, variants) {
      if (defaultValue != null) {
        return defaultValue;
      }
      // A caller offset replaces the weight-based push, including `0`, which
      // pins the parent lightness.
      if (
        variants.$lightnessOffset != null &&
        variants.$lightnessOffset !== false
      ) {
        return defaultValue;
      }
      if (variants.$weight == null) {
        return WEIGHT_STEPS.normal;
      }
      return WEIGHT_STEPS[variants.$weight];
    },
  },
});

/**
 * Paints its only child as the placeholder, so the child keeps its own size and
 * corners. Use it for controls such as buttons, badges, and inputs. The child
 * must generate its own box, because the highlight cannot be clipped to inline
 * text, such as a link or a key. Use a line placeholder for text. Inputs,
 * selects, and textareas show the tint without the shimmer highlight.
 */
export const skeletonFill = cv({
  extend: [skeletonBase],
  class: [
    "ui-skeleton-fill",
    // Important utilities replace the child's own paint.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:bg-(--skeleton-tint)! *:bg-none! *:text-transparent!",
    "*:border-transparent! *:[box-shadow:inset_0_0_0_var(--border-width)_var(--skeleton-edge)]!",
    // Opacity does not apply to the wrapper without a box, so the child fades
    // with the same timing as the other parts, not its own.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:[transition:opacity_var(--default-transition-duration)_var(--default-transition-timing-function)]!",
    // Forced colors replace the transparent text color, so match the text to
    // the background instead. The outline then needs its own color.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "forced-colors:*:text-[Canvas]! forced-colors:*:outline",
    // Stays a class to come after the outline of `ak-outline` on the child,
    // which it replaces in forced colors.
    "forced-colors:*:outline-[CanvasText]",
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:*:invisible",
  ],
  defaultVariants: {
    $borderType: "unset",
    // A frame wrapper would make the child's corners concentric with it, so the
    // child would change shape while it loads.
    $frame: false,
  },
});

/** Fades in content that replaces a skeleton placeholder. */
export const skeletonReveal = cv({
  class: "motion-safe:animate-ui-skeleton-reveal",
});
