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
// the surface it owns: the element, its bar, or the child it fills. The tint
// resolves here, before a filled child redefines the layer color.
const shimmerImage = cx(
  "[--skeleton-highlight:oklch(from_var(--ak-layer)_calc(l+0.07)_c_h)]",
  "in-[.skeleton-shimmer]:[--skeleton-image:linear-gradient(100deg,transparent_30%,var(--skeleton-highlight)_50%,transparent_70%)]",
);

// The highlight starts past the start edge, so a part with reduced motion or
// without a shimmer root shows only its tint.
const shimmerSurface = cx(
  "bg-(image:--skeleton-image,none) bg-size-[200%_100%] bg-no-repeat bg-position-[150%_0]",
  "in-[.skeleton-shimmer]:motion-safe:animate-ui-skeleton-shimmer rtl:[animation-direction:reverse]",
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
  class: ["block forced-colors:outline", shimmerSurface],
  defaultVariants: {
    $rounded: "md",
  },
});

/** A round placeholder, such as for an avatar. */
export const skeletonCircle = cv({
  extend: [skeletonBase],
  class: ["block aspect-square forced-colors:outline", shimmerSurface],
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
    "before:bg-(image:--skeleton-image,none) before:bg-size-[200%_100%] before:bg-no-repeat before:bg-position-[150%_0]",
    "in-[.skeleton-shimmer]:motion-safe:before:animate-ui-skeleton-shimmer rtl:before:[animation-direction:reverse]",
  ],
  defaultVariants: {
    $rounded: "xs",
    // The bar draws its own ring.
    $borderType: "unset",
  },
});

/**
 * Paints its only child as the placeholder, so the child keeps its own size and
 * corners. Use it for controls such as buttons, badges, and inputs.
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
    "*:bg-(--skeleton-tint)! *:text-transparent! *:placeholder:text-transparent!",
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
    "*:bg-(image:--skeleton-image,none)! *:bg-size-[200%_100%]! *:bg-no-repeat!",
    // Important declarations override animations, so the animated position
    // stays normal.
    "*:bg-position-[150%_0]",
    "in-[.skeleton-shimmer]:motion-safe:*:animate-ui-skeleton-shimmer! rtl:*:[animation-direction:reverse]!",
  ],
  defaultVariants: {
    $borderType: "unset",
    // A frame wrapper would make the child's corners concentric with it, so the
    // child would change shape while it loads.
    $frame: false,
  },
});
