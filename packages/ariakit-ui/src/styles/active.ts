import { cv } from "clava";

/** Press scaling and transitions for interactive elements. */
export const active = cv({
  class: "ui-active",
  variants: {
    /** Whether to scale the element when active (pressed). */
    $active: [
      "ui-active--on",
      // Keep the same origin for the press and release.
      // Stays a class, so that the transform-origin of `carouselButton` still
      // comes after it and replaces it.
      "origin-bottom",
    ],
    /**
     * Animates press scaling. Extenders with their own transition list must
     * replace this variant and include `--active-transition` and
     * `--active-duration`.
     */
    $transition: "ui-active--transition",
    /**
     * Horizontal press depth, overriding `$activeDepth`. Use smaller values for
     * wider elements.
     */
    $activeDepthX: (value: number) => ({
      style: { "--active-depth-x": `${value}` },
    }),
    /**
     * Vertical press depth, overriding `$activeDepth`. Use smaller values for
     * taller elements. Controls with descriptions halve the shared depth by
     * default.
     */
    $activeDepthY: (value: number) => ({
      style: { "--active-depth-y": `${value}` },
    }),
    /**
     * Press depth. Use smaller values for larger elements.
     * @default 5
     */
    $activeDepth: (value: number) => ({
      style: { "--active-depth": `${value}` },
    }),
  },
  defaultVariants: {
    $transition: true,
    $activeDepth: 5,
  },
});
