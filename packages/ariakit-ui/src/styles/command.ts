import { cv } from "clava";

export const command = cv({
  class: [
    "not-[a]:cursor-default relative block",
    "[&:not(button)]:select-none",
    // Only apply cursor-pointer to submit buttons that are not disabled
    "[&:where([type='submit'],form_button:only-of-type,a_&)]:not-ak-disabled:cursor-pointer",
    // When active, scale x and y based on depth
    "ak-active:[--command-scale-x:min(100%,96%+4%*calc(1-clamp(0,var(--command-depth-x)/10,1)))]",
    "ak-active:[--command-scale-y:min(100%,94%+6%*calc(1-clamp(0,var(--command-depth-y)/10,1)))]",
    "ak-active:origin-bottom ak-active:scale-x-(--command-scale-x) ak-active:scale-y-(--command-scale-y)",
  ],
  computedVariants: {
    /**
     * Horizontal scale factor applied to the element when pressed. Use a
     * smaller value for larger elements.
     * @default 5
     **/
    $depthX: (value: number) => ({
      "--command-depth-x": `${value}`,
    }),
    /**
     * Vertical scale factor applied to the element when pressed. Use a smaller
     * value for larger elements.
     * @default 5
     **/
    $depthY: (value: number) => ({
      "--command-depth-y": `${value}`,
    }),
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
