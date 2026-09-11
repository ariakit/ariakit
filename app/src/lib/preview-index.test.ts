/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { expect, test } from "vitest";
import {
  EXAMPLES_PREVIEW_KIND,
  SANDBOX_PREVIEW_KIND,
} from "./preview-config.ts";
import { getPreviewIndexPaths } from "./preview-index.ts";

test("excludes sandbox previews from the preview index", () => {
  const paths = getPreviewIndexPaths([
    {
      id: "menu",
      data: {
        frameworks: ["react", "solid"],
        source: EXAMPLES_PREVIEW_KIND,
      },
    },
    {
      id: "dialog-1234",
      data: {
        frameworks: ["react"],
        source: SANDBOX_PREVIEW_KIND,
      },
    },
  ]);

  expect(paths).toEqual(["/react/previews/menu", "/solid/previews/menu"]);
});
