import { cv } from "clava";
import { frame } from "./frame.ts";

/**
 * A frame with vertical padding and extra side padding based on the font
 * metrics. Publishes `--py` and `--px` for aligned slots and gaps. Extend this
 * instead of `frame` for padded text.
 */
export const textFrame = cv({
  extend: [frame],
  variants: {
    /**
     * Sets side padding. Named sizes scale the optical extra added to frame
     * padding; other CSS values replace the full side padding. Ignored when
     * `$p` is `"none"`.
     */
    $px(value?: "sm" | "md" | "lg" | "xl" | "2xl" | (string & {})) {
      if (value == null) return;
      if (value === "sm") return "[--px-scale:0]";
      if (value === "md") return "[--px-scale:0.5]";
      if (value === "lg") return "[--px-scale:0.75]";
      if (value === "xl") return "[--px-scale:1.25]";
      if (value === "2xl") return "[--px-scale:1.5]";
      return {
        style: {
          "--px": value,
          "--text-frame-inset": `calc(${value} - var(--ak-frame-padding,0px))`,
        },
      };
    },
  },
  defaultVariants: {
    $px(defaultValue, variants) {
      if (variants.$p === "none") return;
      return defaultValue ?? "md";
    },
  },
  refine({ variants, addClass, addStyle }) {
    if (variants.$p === "none") {
      // Publish zero spacing so slots and gaps inside do not read an ancestor
      // text frame. Unlike `$p={0}`, this also drops the optical side inset.
      addClass("[--px:0px] [--py:0px] [--text-frame-inset:0px]");
      // A raw `$px` sets inline values for a side padding that the frame never
      // applies. The refine style replaces them.
      if (variants.$px != null) {
        addStyle({ "--px": "0px", "--text-frame-inset": "0px" });
      }
      return;
    }
    addClass([
      // Derive the optical inset from line height and capital height. A raw
      // `$px` wins through the style attribute.
      "[--px:calc(var(--ak-frame-padding,0px)+(1lh-1cap)*var(--px-scale))]",
      "[--py:var(--ak-frame-padding,0px)]",
      // Register the inset as a length so slots with different font metrics
      // inherit the same spacing.
      "[--text-frame-inset:calc((1lh-1cap)*var(--px-scale))]",
      "px-(--px) py-(--py)",
    ]);
  },
});
