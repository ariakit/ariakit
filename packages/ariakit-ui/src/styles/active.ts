import { cv } from "clava";

/** Press scaling and transitions for interactive elements. */
export const active = cv({
  class: [
    // Keep these channels defined even when $active is off so composed
    // transition lists stay valid.
    "[--active-transition:scale] [--active-duration:100ms]",
  ],
  variants: {
    /** Whether to scale the element when active (pressed). */
    $active: [
      // Per-axis depths override the shared depth, including values set through
      // the style attribute.
      "ui-active:[--active-scale-x:min(100%,98%+2%*calc(1-clamp(0,var(--active-depth-x,var(--active-depth))/10,1)))]",
      "ui-active:[--active-scale-y:min(100%,94%+6%*calc(1-clamp(0,var(--active-depth-y,var(--active-depth))/10,1)))]",
      // Keep the same origin for the press and release.
      "origin-bottom ui-active:scale-x-(--active-scale-x) ui-active:scale-y-(--active-scale-y)",
      // Halve vertical depth for taller controls with descriptions.
      // $activeDepthY still overrides this rule.
      "has-[.control-description]:[--active-depth-y:calc(var(--active-depth)*0.5)]",
    ],
    /**
     * Animates press scaling. Extenders with their own transition list must
     * replace this variant and include `--active-transition` and
     * `--active-duration`.
     */
    $transition:
      "transition-(--active-transition) duration-(--active-duration)",
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
