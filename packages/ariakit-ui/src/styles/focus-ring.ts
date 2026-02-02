import { cv } from "clava";

export const focusRing = cv({
  variants: {
    /**
     * Whether to show a focus ring when it receives keyboard focus and how
     * thick it should be.
     */
    $focusRing: {
      1: "ui-focus-visible:outline",
      true: "ui-focus-visible:outline-2",
      2: "ui-focus-visible:outline-2",
      3: "ui-focus-visible:outline-3",
    },
    /**
     * The color of the focus ring.
     */
    $focusRingColor: {
      unset: "",
      primary: "ak-outline-primary",
    },
    /**
     * The offset of the focus ring.
     */
    $focusRingOffset: {
      none: "",
      1: "outline-offset-1",
      2: "outline-offset-2",
    },
  },
  computed: ({ variants, setDefaultVariants }) => {
    if (!variants.$focusRing) return;
    setDefaultVariants({ $focusRingColor: "primary", $focusRingOffset: 1 });
  },
});
