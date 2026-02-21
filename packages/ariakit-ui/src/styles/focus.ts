import { cv } from "clava";

export const focus = cv({
  variants: {
    /**
     * Whether to show a focus ring when it receives keyboard focus and how
     * thick it should be.
     */
    $focus: {
      1: "ui-focus-visible:outline",
      true: "ui-focus-visible:outline-2",
      2: "ui-focus-visible:outline-2",
      3: "ui-focus-visible:outline-3",
    },
    /**
     * The color of the focus ring.
     */
    $focusColor: {
      unset: "",
      primary: "ak-outline-primary",
    },
    /**
     * The offset of the focus ring.
     */
    $focusOffset: {
      none: "",
      1: "outline-offset-1",
      2: "outline-offset-2",
    },
  },
  computed: ({ variants, setDefaultVariants }) => {
    if (!variants.$focus) return;
    setDefaultVariants({ $focusColor: "primary", $focusOffset: 1 });
  },
});
