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
import { getOGImagePath, getPageOGImagePath } from "./og-image-path.ts";

test("getOGImagePath converts page paths to image paths", () => {
  expect(getOGImagePath("/")).toBe("/og-image/default.png");
  expect(getOGImagePath("/react/components/dialog/")).toBe(
    "/og-image/react_components_dialog.png",
  );
});

test.each([
  [{}, "/og-image/default.png"],
  [{ type: "pages" as const }, "/og-image/default.png"],
  [
    { type: "components" as const, framework: "react" as const },
    "/og-image/react_components.png",
  ],
  [
    {
      id: "dialog",
      type: "components" as const,
      framework: "react" as const,
    },
    "/og-image/react_components_dialog.png",
  ],
  [
    {
      id: "ariakit-react/getting-started",
      type: "components" as const,
      framework: "react" as const,
      pagePath: "/react/components/getting-started/",
    },
    "/og-image/react_components_getting-started.png",
  ],
  [
    {
      id: "ariakit-tailwind/setup",
      type: "styles" as const,
      framework: "tailwind" as const,
      pagePath: "/styles/setup/",
    },
    "/og-image/styles_setup.png",
  ],
  [
    {
      id: "",
      type: "examples" as const,
      framework: "react" as const,
    },
    "/og-image/default.png",
  ],
])("getPageOGImagePath maps %o to %s", (params, expected) => {
  expect(getPageOGImagePath(params)).toBe(expected);
});
