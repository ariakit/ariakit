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
  /**
   * The markup that the card renders live on its stage, such as the code of an
   * `html preview` fence.
   */
  html?: string;
  /**
   * The example that the card renders on its stage instead of `html`. An MDX
   * page passes it as the `preview` slot, so the stage can render a real code
   * example while the code block shows a simpler version of it.
   */
  preview?: ReactNode;
  /**
   * The code of the example, such as the code block that `remarkCodeFences`
   * renders for the fence of the page.
   */
  children?: ReactNode;
}

function getStageContent({ html, preview }: ExampleCardProps) {
  if (preview != null) return { children: preview };
  // The examples come from the MDX source of the app, not from users.
  return { dangerouslySetInnerHTML: { __html: html ?? "" } };
}

/**
 * Shows a live example above its code. The `remarkPreviewFences` plugin renders
 * each `html preview` code fence with this card, and the stage renders the
 * markup of the fence. A page can also render a real code example on the stage
 * with the `preview` slot, and show a simpler version of it in the fence. A
 * fence in a written card doesn't get the 12-line default of a preview fence,
 * so set `maxLines` on it when its code is long.
 *
 * ````mdx
 * import BackdropExample from "./backdrop/index.react.tsx";
 *
 * <ExampleCard>
 *   <BackdropExample slot="preview" />
 *
 * ```html
 * <div class="ak-layer ak-frame ak-frame-xl/2 ak-frame-bordering"></div>
 * ```
 *
 * </ExampleCard>
 * ````
 */
export function ExampleCard({ html, preview, children }: ExampleCardProps) {
  return (
    <div data-example-card className="grid gap-2">
      <Frame
        data-example-stage
        $border
        $rounded="xl"
        $layer="canvas"
        $p={6}
        // The app gives islands the display of their parent with !important,
        // so the island of a hydrated preview needs `display: contents` with
        // !important to let the elements of the example center and space like
        // fence markup.
        className="grid min-w-0 place-items-center gap-3 overflow-auto [&>astro-island]:contents!"
        {...getStageContent({ html, preview })}
      />
      {children}
    </div>
  );
}
