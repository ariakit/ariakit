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
// reaches 1rem. The app spacing token is smaller than 0.25rem, so a spacing
// step would fall short and square their corners.
const STAGE_PADDING = "1rem";

// A state layer shifts the whole card stage while an ancestor with the
// `group/thumbnail` class is hovered or focused. Shifting the stage layer
// instead would make every color inside recompute, and colors near the
// forbidden lightness band can flip between light and dark.
const stateLayer = clsx(
  "relative after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
  "after:opacity-0 after:transition-opacity motion-reduce:after:transition-none",
  "ak-light:after:bg-black/7 ak-dark:after:bg-white/6",
  "group-hover/thumbnail:after:opacity-100",
  "group-focus-visible/thumbnail:after:opacity-100",
);

// The wrapper border strengthens while an ancestor with the `group/thumbnail`
// class is hovered, focused, or the current page. The `$edgeWeight` variant
// writes an inline value, which a state cannot change, so states use the
// matching utilities.
const cardStateEdge = clsx(
  "group-hover/thumbnail:ak-edge-alpha-15",
  "group-focus-visible/thumbnail:ak-edge-alpha-15",
);

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
   * `card` fills the width of a page card and zooms in when an ancestor with
   * the `group/thumbnail` class is hovered or focused. `slot` draws a small
   * thumbnail, drawn for a box about 60px by 40px, in a 4:3 box such as a
   * navigation slot. Both strengthen their border while the `group/thumbnail`
   * ancestor is hovered or focused, and slots also while it is the current
   * page. Set the slot height with `className`; the width follows the ratio.
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
 * Renders an example thumbnail in a bordered surface. Card thumbnails of
 * different sizes sit at a consistent position: short scenes are centered, and
 * tall scenes start near the top instead of losing their first rows.
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
          "block aspect-4/3 overflow-clip [container-type:size]",
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
        "flex h-48 items-center-safe justify-center overflow-clip",
        // Wide scenes must not widen grid and flex parents.
        "contain-inline-size [content-visibility:auto]",
        stateLayer,
        cardStateEdge,
        className,
      )}
      {...props}
    >
      <span
        // The scene is a picture of the example, so it is out of the tab order
        // and the accessibility tree.
        inert
        className={clsx(
          // The negative margin lets the scene grow past the stage before safe
          // alignment moves it to the top. After scaling, the top of a tall
          // scene lands just below the top edge of the stage.
          "-m-10 grid content-center-safe justify-items-center",
          "origin-center scale-70",
          "transition-transform duration-600 ease-out motion-reduce:transition-none",
          "group-hover/thumbnail:scale-75 group-focus-visible/thumbnail:scale-75",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Frame>
  );
}
