import { cv, cx } from "clava";
import { frame } from "./frame.ts";

const WEIGHT_STEPS = { light: 1, normal: 2, medium: 4, bold: 6 } as const;

/**
 * The loading area. It owns the animation, so all parts inside it move in step.
 * Parts outside a root never animate.
 */
export const skeleton = cv({
  class: "skeleton",
  variants: {
    /**
     * Sets the animation of the parts. `shimmer` moves a highlight across each
     * part and falls back to `pulse` with reduced motion. `pulse` fades the
     * whole area.
     */
    $animate: {
      shimmer: "skeleton-shimmer motion-reduce:animate-pulse",
      pulse: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    $animate: "shimmer",
  },
});

// Parts read the highlight from a variable so that each shape can paint it on
// its own layer: over the element, its bar, or the child it fills. The tint
// resolves here, before a filled child redefines the layer color.
const shimmerImage = cx(
  "[--skeleton-highlight:oklch(from_var(--ak-layer)_calc(l+0.07)_c_h)]",
  "in-[.skeleton-shimmer]:[--skeleton-image:linear-gradient(100deg,transparent_30%,var(--skeleton-highlight)_50%,transparent_70%)]",
);

// The highlight moves on a layer twice the part's width. Moving a layer runs on
// the compositor, while moving a background repaints the part on every frame.
// The layers can move the part's edges by a fraction of a pixel, so they exist
// only while the highlight moves.
const shimmerLayer = cx(
  "before:hidden ui-skeleton-shimmer:before:block",
  // Paint containment clips the layer to the part's corners and gives it a
  // containing block without changing how the part is positioned.
  "ui-skeleton-shimmer:contain-paint",
  "before:absolute before:inset-y-0 before:left-0 before:w-[200%]",
  "before:bg-(image:--skeleton-image,none)",
  // The direction shares the variant, so the animation shorthand cannot reset
  // it.
  "ui-skeleton-shimmer:before:animate-ui-skeleton-shimmer ui-skeleton-shimmer:rtl:before:[animation-direction:reverse]",
);

// The inset edge moves from the part to a layer above the highlight, so the
// highlight passes under it, as it did as a background. Other edge types paint
// outside the clipped layer.
const shimmerInsetEdge = cx(
  "after:hidden ui-skeleton-shimmer:after:block ui-skeleton-shimmer:ring-0",
  "after:absolute after:inset-0 after:rounded-[inherit]",
  "after:ring-(length:--border-width) after:ring-inset after:ring-(--ak-edge)",
);

/** Shared tint, edge, and highlight for every skeleton part. */
const skeletonBase = cv({
  extend: [frame],
  class: [
    "select-none pointer-events-none",
    // A pending part keeps its space without painting, so the layout does not
    // move when the placeholders fade in.
    "transition-opacity data-pending:opacity-0",
    shimmerImage,
  ],
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
  class: ["block forced-colors:outline", shimmerLayer],
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
  class: ["block aspect-square forced-colors:outline", shimmerLayer],
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
 * paints a bar the height of capital letters, so text that replaces it does not
 * move the layout.
 */
export const skeletonLine = cv({
  extend: [skeletonBase],
  class: [
    "block h-lh relative bg-transparent!",
    // A pseudo-element paints the bar. Vertical margins on the element itself
    // would collapse with siblings and move the layout.
    "before:absolute before:inset-x-0 before:inset-y-[calc((1lh-1cap)/2)]",
    "before:rounded-[inherit] before:bg-(--ak-layer)",
    "before:ring-(length:--border-width) before:ring-inset before:ring-(--ak-edge)",
    "forced-colors:before:outline",
    // The highlight moves on a layer above the bar, twice its width. Paint
    // containment clips it to the bar's ends, and a clip path to the bar's
    // height and corners. As on the other parts, they exist only while the
    // highlight moves.
    "after:hidden ui-skeleton-shimmer:after:block ui-skeleton-shimmer:contain-paint",
    "ui-skeleton-shimmer:[clip-path:inset(calc((1lh-1cap)/2)_0_round_var(--ak-frame-radius))]",
    "after:absolute after:inset-y-[calc((1lh-1cap)/2)] after:left-0 after:w-[200%]",
    "after:bg-(image:--skeleton-image,none)",
    "ui-skeleton-shimmer:after:animate-ui-skeleton-shimmer ui-skeleton-shimmer:rtl:after:[animation-direction:reverse]",
  ],
  defaultVariants: {
    $rounded: "xs",
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
    // The wrapper generates no box, so the child keeps its place in the parent
    // layout. Custom properties still pass through it to the child.
    "contents",
    // Resolve the tint here, before the child's own layer redefines these
    // variables.
    "[--skeleton-tint:var(--ak-layer)] [--skeleton-edge:var(--ak-edge)]",
    // Important utilities replace the child's own paint.
    "*:bg-(--skeleton-tint)! *:bg-none! *:text-transparent! *:placeholder:text-transparent!",
    "*:border-transparent! *:[box-shadow:inset_0_0_0_var(--border-width)_var(--skeleton-edge)]!",
    // The before and after variants would add pseudo-elements that take space
    // in a flex child, so these selectors only hide existing ones.
    "*:*:invisible *:[&::before]:invisible *:[&::after]:invisible",
    // Opacity does not apply to the wrapper without a box, so the child fades
    // with the same timing as the other parts, not its own.
    "*:[transition:opacity_var(--default-transition-duration)_var(--default-transition-timing-function)]!",
    "data-pending:*:opacity-0!",
    // Forced colors replace the transparent text color, so match the text to
    // the background instead. The outline then needs its own color.
    "forced-colors:*:outline forced-colors:*:outline-[CanvasText]",
    "forced-colors:*:text-[Canvas]!",
    // While the highlight moves, the child's pseudo-elements carry it and the
    // edge, as on the other parts.
    "ui-skeleton-fill-shimmer",
  ],
  defaultVariants: {
    $borderType: "unset",
    // A frame wrapper would make the child's corners concentric with it, so the
    // child would change shape while it loads.
    $frame: false,
  },
});
