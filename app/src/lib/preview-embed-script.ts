/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

// The script serializes `setupPreviewEmbed` when this module loads, so it lives
// apart from the messages in `preview-embed.ts`. Pages that import only the
// messages then don't bundle the function.
import { setupPreviewEmbed } from "./preview-embed.ts";

/**
 * The inline script that runs `setupPreviewEmbed` in a preview page. Bundlers
 * that keep function names, such as esbuild in the Next.js Worker build, wrap
 * nested functions in a `__name` helper from the module scope, which the
 * serialized function cannot reach. So the script defines its own.
 */
export const previewEmbedScript = `(() => {
  const __name = (target) => target;
  (${setupPreviewEmbed.toString()})();
})();`;
