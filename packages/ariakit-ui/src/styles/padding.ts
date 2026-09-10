import { cv } from "clava";
import { frame } from "./frame.ts";

/**
 * A frame that spends its padding the way a control does: the frame padding
 * above and below the content, and on the sides that padding plus an optical
 * extra, so a line of text sits as far from a rounded edge as it looks to. The
 * two are published as `--py` and `--px`, measured in the element's own font,
 * for the slots and gaps that line up with them. Extend this in place of
 * `frame` wherever a line of text sits in a padded box: a control, a nav group
 * label or a list row. Extending both would apply the frame twice.
 */
export const padding = cv({
  extend: [frame],
  variants: {
    /**
     * Sets the side padding. A named step scales the optical extra added to the
     * frame padding; rounded elements often look best with more. Any other
     * value replaces the side padding, such as one measured on an ancestor and
     * passed down as a length (`var(--nav-px)`).
     */
    $px(value?: "sm" | "md" | "lg" | "xl" | (string & {})) {
      if (value == null) return;
      if (value === "sm") return "[--px-scale:0]";
      if (value === "md") return "[--px-scale:0.5]";
      if (value === "lg") return "[--px-scale:0.75]";
      if (value === "xl") return "[--px-scale:1.25]";
      return { style: { "--px": value } };
    },
  },
  defaultVariants: {
    // Without frame padding there is nothing for the scale to add to, and
    // refine emits no padding formula to spend it on.
    $px(defaultValue, variants) {
      if (variants.$p === "none") return;
      return defaultValue ?? "md";
    },
  },
  refine({ variants, addClass }) {
    if (variants.$p === "none") return;
    addClass([
      // The extra is a share of the room a line of text leaves above and
      // below its capitals, so it follows the font and the line height. The
      // value written by a raw $px lands in the style attribute and wins over
      // this formula.
      "[--px:calc(var(--ak-frame-padding,0px)+(1lh-1cap)*var(--px-scale))]",
      "[--py:var(--ak-frame-padding,0px)]",
      "px-(--px) py-(--py)",
    ]);
  },
});
