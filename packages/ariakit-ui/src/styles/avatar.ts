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
  class: "ui-avatar font-medium",
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
  class: "ui-avatar-image",
});

/**
 * A row of avatars where each one covers the end of the one before it. It sets
 * one size for its avatars. An avatar inside another element, such as a tooltip
 * anchor, still gets the ring, and the element takes the overlap.
 */
export const avatarGroup = cv({
  class: "ui-avatar-group",
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
