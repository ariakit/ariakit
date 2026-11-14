import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { getDisabledContentClass } from "./control.ts";
import { focus } from "./focus.ts";
import { frame } from "./frame.ts";
import { hasLayerBackground } from "./layer.ts";

/**
 * Sets the size that an avatar reads, on the avatar itself or on a group around
 * it. Numbers scale the spacing token; strings apply directly.
 */
function getAvatarSizeStyle(value?: number | (string & {})) {
  if (value == null) return;
  return { style: { "--avatar-size": getSpacingValue(value) } };
}

/**
 * A round box for a photo, initials, or an icon. It is two lines of text tall
 * by default. In a slot, it fills the slot height, so the slot `$size` sets its
 * size. Use a `box` slot, which takes the width of the avatar. The initials
 * scale with the avatar. It does not clip its content, so a child can hang over
 * its edge.
 */
export const avatar = cv({
  extend: [frame, focus],
  class: [
    "relative inline-grid flex-none place-items-center",
    "font-medium whitespace-nowrap",
    // In running text, an avatar of one line fills the line box from its top,
    // so it does not make the line taller. Flex and grid items ignore this.
    "align-top",
    // The same default as the group, which sets --avatar-size for its avatars.
    "[--avatar-box:var(--avatar-size,2lh)]",
    // In a slot, the slot height sets the size, also with $size. --slot-height
    // is a registered length, so it keeps the font of the slot.
    "[.slot-frame-slot>&]:[--avatar-box:var(--slot-height)]",
    "size-(--avatar-box)",
    // Preserve the line height and set the capital height of the initials to
    // 0.3 times the avatar size. tan(atan2(a,b)) divides lengths where Firefox
    // calc() cannot.
    "leading-[1lh] [font-size-adjust:cap-height_calc(0.3*tan(atan2(var(--avatar-box),1em)))]",
    "[&>svg]:block [&>svg]:size-[50%]",
    // In a group, a ring in the color of the surface around the avatar reads
    // as a gap between it and the avatar that it covers. It is a box shadow,
    // not a ring utility, so a border drawn as a ring stays inside it.
    "in-[.avatar-group]:shadow-[0_0_0_max(2px,calc(var(--avatar-box)/16))_var(--ak-layer-parent)]",
    // Draw the focus ring over the next avatar.
    "in-[.avatar-group]:ui-focus-visible:z-1",
  ],
  variants: {
    /**
     * Sets the avatar size. Numbers scale the spacing token, so the avatar
     * follows the font size; strings apply directly as CSS lengths, such as
     * `"1lh"` for one line of text. In a slot, the slot sets the size.
     * @default "2lh"
     */
    $size: getAvatarSizeStyle,
  },
  defaultVariants: {
    $layer(defaultValue) {
      // Replace only frame's transparent default; preserve explicit colors.
      if (defaultValue !== "transparent") return defaultValue;
      return true;
    },
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // An offset would paint an avatar without a surface, such as an outlined
      // one.
      if (!variants.$layer) return false;
      if (variants.$layer === "transparent") return false;
      // Shift the surface away from the parent, so the avatar shows on a
      // surface of the same color.
      return true;
    },
    $rounded: "full",
    // Stay round inside padded frames, which would otherwise reduce the radius
    // to follow their corners.
    $forceRounded: true,
    $p: "none",
  },
  refine({ variants, addClass }) {
    // An avatar in a disabled control fades like the slots of the control.
    addClass(getDisabledContentClass(variants));
    // Forced colors remove the fill, which may be the only boundary.
    if (variants.$border != null) return;
    if (!hasLayerBackground(variants)) return;
    addClass("forced-colors:ak-frame-border");
  },
});

/**
 * An image that covers the avatar and what is under it, such as the initials.
 * The avatar does not clip, so the image takes the corners of the avatar. A
 * transparent image shows what is under it.
 */
export const avatarImage = cv({
  class: "absolute inset-0 size-full object-cover rounded-[inherit]",
});

/**
 * A row of avatars where each one covers the end of the one before it. It sets
 * one size for its avatars. An avatar inside another element, such as a tooltip
 * anchor, still gets the ring, and the element takes the overlap.
 */
export const avatarGroup = cv({
  class: [
    "avatar-group flex",
    // The same default as the avatar. The overlap below needs the size here,
    // and the avatars inherit it.
    "[--avatar-size:2lh]",
    "*:not-first:ms-[calc(var(--avatar-size)/-8)]",
  ],
  variants: {
    /**
     * Sets the size of the avatars in the group. Numbers scale the spacing
     * token; strings apply directly as CSS lengths. An avatar with its own
     * `$size` keeps it.
     * @default "2lh"
     */
    $size: getAvatarSizeStyle,
  },
});
