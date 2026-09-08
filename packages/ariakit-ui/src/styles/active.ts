import { cv } from "clava";

export const active = cv({
  class: [
    // What a press animates and how long it takes, published with $active on
    // or off, so a transition list of the element's own can end with both and
    // stay valid (see $transition).
    "[--active-transition:scale] [--active-duration:100ms]",
  ],
  variants: {
    /**
     * Whether to scale the element when active (pressed).
     */
    $active: [
      // When active, scale x and y based on depth
      "ui-active:[--active-scale-x:min(100%,96%+4%*calc(1-clamp(0,var(--active-depth-x)/10,1)))]",
      "ui-active:[--active-scale-y:min(100%,94%+6%*calc(1-clamp(0,var(--active-depth-y)/10,1)))]",
      // The origin holds at rest as well, so the release eases back around
      // the same edge the press sank toward.
      "origin-bottom ui-active:scale-x-(--active-scale-x) ui-active:scale-y-(--active-scale-y)",
    ],
    /**
     * Whether the press eases in and out rather than snapping. A recipe that
     * runs a transition list of its own replaces this with a function variant
     * of the same name, which drops these classes, and ends its own lists with
     * `var(--active-transition)` and `var(--active-duration)`: two lists on one
     * element only fight over the cascade, and the alphabetical order of
     * arbitrary utilities decides which one wins.
     */
    $transition:
      "transition-(--active-transition) duration-(--active-duration)",
    /**
     * Horizontal scale factor applied to the element when pressed. Use a
     * smaller value for larger elements.
     * @default 5
     **/
    $activeDepthX: (value: number) => ({
      style: { "--active-depth-x": `${value}` },
    }),
    /**
     * Vertical scale factor applied to the element when pressed. Use a smaller
     * value for larger elements.
     * @default 5
     **/
    $activeDepthY: (value: number) => ({
      style: { "--active-depth-y": `${value}` },
    }),
    /**
     * Scale factor applied to the element when pressed. Use a smaller value for
     * larger elements.
     * @default 5
     **/
    $activeDepth: (_value: number) => {},
  },
  defaultVariants: {
    $transition: true,
    $activeDepth: 5,
    // defaultValue first so extending components can set their own constant
    // depth defaults without them being swallowed by $activeDepth.
    $activeDepthX: (defaultValue, variants) =>
      defaultValue ?? variants.$activeDepth,
    $activeDepthY: (defaultValue, variants) =>
      defaultValue ?? variants.$activeDepth,
  },
});
