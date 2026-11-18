/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import type { ReactNode } from "react";

export interface ExampleCardProps {
  /** The markup that the card renders live on its stage. */
  html: string;
  /**
   * The code of the example, such as the code block that `remarkCodeFences`
   * renders for the fence of the page.
   */
  children?: ReactNode;
}

/**
 * Shows a live example with its code. The `remarkPreviewFences` plugin renders
 * each `html preview` code fence with this card. The code sits on the left of
 * the example when the card is wide enough, and under it otherwise.
 */
export function ExampleCard({ html, children }: ExampleCardProps) {
  return (
    <Frame
      data-example-card
      $border
      $rounded="2xl"
      $lighten={0.3}
      $p={1}
      // The example comes first, so it's on top when the parts wrap. The
      // reversed row puts the code on the left while both fit.
      className="flex flex-row-reverse flex-wrap gap-1"
    >
      <Frame
        data-example-stage
        $border
        $borderType="ring"
        $layer="canvas"
        $p={6}
        className="grid min-w-0 flex-[1_1_20rem] place-items-center gap-3 overflow-auto"
        // The examples come from the MDX source of the app, not from users.
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {/* A grid stretches the code block to the height of the example. */}
      <div className="grid min-w-0 flex-[1_1_20rem]">{children}</div>
    </Frame>
  );
}
