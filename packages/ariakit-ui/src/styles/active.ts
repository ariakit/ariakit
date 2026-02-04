import { cv } from "clava";

export const active = cv({
  variants: {
    /**
     * Whether to scale the element when active (pressed).
     */
    $active: [
      // When active, scale x and y based on depth
      "ui-active:[--active-scale-x:min(100%,96%+4%*calc(1-clamp(0,var(--active-depth-x)/10,1)))]",
      "ui-active:[--active-scale-y:min(100%,94%+6%*calc(1-clamp(0,var(--active-depth-y)/10,1)))]",
      "ui-active:origin-bottom ui-active:scale-x-(--active-scale-x) ui-active:scale-y-(--active-scale-y)",
    ],
  },
  computedVariants: {
    /**
     * Horizontal scale factor applied to the element when pressed. Use a
     * smaller value for larger elements.
     * @default 5
     **/
    $depthX: (value: number) => ({ "--active-depth-x": `${value}` }),
    /**
     * Vertical scale factor applied to the element when pressed. Use a smaller
     * value for larger elements.
     * @default 5
     **/
    $depthY: (value: number) => ({ "--active-depth-y": `${value}` }),
    /**
     * Scale factor applied to the element when pressed. Use a smaller value for
     * larger elements.
     * @default 5
     **/
    $depth: (_value: number) => {},
  },
  defaultVariants: {
    $depth: 5,
  },
  computed: (context) => {
    context.setDefaultVariants({
      $depthX: context.variants.$depth,
      $depthY: context.variants.$depth,
    });
  },
});
