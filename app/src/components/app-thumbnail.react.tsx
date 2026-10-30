/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { clsx } from "clsx";

// Frames inside the scene keep their own radius only when the stage padding
// reaches 1rem. The app spacing token is smaller than 0.25rem, so the padding
// is in rem to stay above that threshold.
const STAGE_PADDING = "2rem";

// The wrapper border strengthens while an ancestor with the `group/thumbnail`
// class is hovered, focused, or the current page. The `$edgeWeight` variant
// writes an inline value, which a state cannot change, so states use the
// matching utilities.
const slotStateEdge = clsx(
  "group-hover/thumbnail:ak-edge-alpha-25",
  "group-focus-visible/thumbnail:ak-edge-alpha-25",
  "group-aria-[current=page]/thumbnail:ak-edge-alpha-25",
);

export interface AppThumbnailProps extends Omit<FrameProps, "children"> {
  /**
   * The static markup from `renderThumbnail`. Use a large thumbnail for `card`
   * and a small one for `slot`.
   */
  html: string;
  /**
   * `card` fills its grid area in a page card and fades its scene. The scene
   * shows at full opacity and zooms in when an ancestor with the
   * `group/thumbnail` class is hovered or focused. `slot` draws a small
   * thumbnail, drawn for a box about 60px by 40px, in a 4:3 box such as a
   * navigation slot. Slots strengthen their border while the `group/thumbnail`
   * ancestor is hovered, focused, or the current page. Set the slot height with
   * `className`; the width follows the ratio.
   * @default "card"
   */
  size?: "card" | "slot";
  /**
   * The color that the thumbnail surface darkens from. Pass a color that does
   * not change with the state of the parent, such as the color of the
   * surrounding navigation, so the colors inside do not recompute.
   */
  surface?: string;
}

/**
 * Renders an example thumbnail in a bordered surface. Card scenes sit at the
 * top of the stage, centered when they fit and otherwise running off its right
 * and bottom edges. A scene root with `max-w-full` shrinks to fit the stage
 * width instead.
 */
export function AppThumbnail({
  html,
  size = "card",
  surface,
  className,
  ...props
}: AppThumbnailProps) {
  if (size === "slot") {
    return (
      <Frame
        render={<span />}
        $layer={surface ?? true}
        $darken={0.5}
        $rounded="md"
        $border
        // A real border in both modes lets covering scene frames share it.
        $borderType="border"
        // Matches the borders inside small scenes.
        $edgeWeight={15}
        $p="none"
        className={clsx(
          "block aspect-4/3 overflow-clip @container-size",
          slotStateEdge,
          className,
        )}
        {...props}
      >
        {/* Small scenes fill the slot without padding, so the slot border is
            the scene edge. The canvas is not a frame, so scene frames nest in
            the slot frame and can cover it or share its border. Scene sizes
            and radii are em-based, and the font size follows the slot height,
            so the whole scene scales to fill any slot size. Scenes are drawn
            for a 3.5px font in a 38px-tall slot. The lightness multiplier
            strengthens every lightness shift inside the scene, so its shapes
            stay visible at this size. */}
        <span
          inert
          className="flex size-full flex-col text-[9.25cqh] [--layer-lightness-multiplier:1.5] *:flex-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Frame>
    );
  }
  return (
    <Frame
      render={<span />}
      $layer={surface ?? true}
      $darken={0.5}
      $rounded="lg"
      $border
      $p={STAGE_PADDING}
      className={clsx(
        "block overflow-clip",
        // Wide scenes must not widen grid and flex parents.
        "contain-inline-size [content-visibility:auto]",
        // Scenes lay out at this inverse size and scale down to fit the stage.
        "[--scene-scale:0.75]",
        // The scale also shrinks corners, so they read as square at this size.
        // The scene takes the theme radius scaled up by the inverse, so its
        // corners keep the size they have in the real UI.
        "[--scene-radius:calc(var(--radius)/var(--scene-scale))]",
        className,
      )}
      {...props}
    >
      <span
        // The scene is a picture of the example, so it is out of the tab order
        // and the accessibility tree.
        inert
        className={clsx(
          "block size-full",
          // A faded scene keeps the card label in front. Hovering or focusing
          // the card shows the scene at full opacity and zooms it in.
          "opacity-80 origin-top transition-[scale,opacity] duration-600 ease-out motion-reduce:transition-none",
          "group-hover/thumbnail:scale-103 group-focus-visible/thumbnail:scale-103",
          "group-hover/thumbnail:opacity-100 group-focus-visible/thumbnail:opacity-100",
        )}
      >
        <span
          className={clsx(
            // Scenes render at 16px, so em-based frame padding of 1em or more
            // reaches the 1rem that lets nested frames keep their own corners,
            // as in the real UI. A scale then draws the whole scene smaller.
            // CSS zoom would draw it smaller too, but Safari squares the frame
            // corners under it.
            "relative grid origin-top-left text-base [scale:var(--scene-scale)]",
            "h-[calc(100%/var(--scene-scale))] w-[calc(100%/var(--scene-scale))]",
            "[--radius:var(--scene-radius)]",
            // Scenes that fit the stage are centered. Wider ones start at the
            // left and the stage clips what runs past its right and bottom
            // edges. The column takes the stage width, so a percentage width on
            // the scene root resolves against the stage.
            "grid-cols-[minmax(0,1fr)] content-start justify-items-center-safe",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </span>
    </Frame>
  );
}
