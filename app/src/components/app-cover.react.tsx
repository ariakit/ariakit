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
import { cx } from "clava";

// Frames inside the scene keep their own radius only when the stage padding
// reaches 1rem. The app spacing token is smaller than 0.25rem, so the padding
// is in rem to stay above that threshold.
const STAGE_PADDING = "2rem";

export interface AppCoverProps extends Omit<FrameProps, "children"> {
  /**
   * The static markup from `renderCover`.
   */
  html: string;
}

/**
 * Renders the cover of a page card in a bordered surface that fills its grid
 * area and fades its scene. The scene shows at full opacity when an ancestor
 * with the `group/cover` class is hovered or focused, and zooms in only while
 * it is hovered. Scenes sit at the top of the stage, centered when they fit and
 * otherwise running off its right and bottom edges. A scene root with
 * `max-w-full` shrinks to fit the stage width instead.
 */
export function AppCover({ html, className, ...props }: AppCoverProps) {
  return (
    <Frame
      render={<span />}
      $layer
      $darken={0.5}
      $rounded="lg"
      $border
      $p={STAGE_PADDING}
      className={cx(
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
        className={cx(
          "block size-full",
          // A faded scene keeps the card label in front. Hovering or focusing
          // the card shows the scene at full opacity, and hovering zooms it in.
          "opacity-80 origin-top transition-[scale,opacity] duration-600 ease-out motion-reduce:transition-none",
          // TODO: Zoom in on focus again once Chromium keeps the reading-flow
          // order of the card grid. In Chromium 156 to 158, a transform change
          // inside a grid item can make the next Tab follow the DOM order, so
          // a zoom on focus would break each Tab. The hover zoom can still
          // break it while the pointer rests on a card.
          // https://issues.chromium.org/issues/582923442
          "group-hover/cover:scale-103",
          "group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100",
        )}
      >
        <span
          className={cx(
            // Scenes render at 16px, so em-based frame padding of 1em or more
            // reaches the 1rem that lets nested frames keep their own corners,
            // as in the real UI. A scale then draws the whole scene smaller.
            // CSS zoom would draw it smaller too, but Safari squares the frame
            // corners under it.
            "relative grid origin-top-left text-base scale-(--scene-scale)",
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
