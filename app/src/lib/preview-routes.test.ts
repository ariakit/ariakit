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
import { getPreviewPath, getPreviewPaths } from "./preview-routes.ts";

test("builds the preview path of an index", () => {
  expect(getPreviewPath({ framework: "react", id: "menu" })).toBe(
    "react/previews/menu",
  );
  expect(getPreviewPath({ framework: "solid", id: "combobox-5518" })).toBe(
    "solid/previews/combobox-5518",
  );
});

test("builds the preview path of a route", () => {
  expect(
    getPreviewPath({ framework: "astro", id: "ariakit-ui", route: "button" }),
  ).toBe("astro/previews/ariakit-ui/button");
});

test("ignores an empty route", () => {
  expect(getPreviewPath({ framework: "astro", id: "gallery", route: "" })).toBe(
    "astro/previews/gallery",
  );
});

test("lists the index path of every framework", () => {
  expect(
    getPreviewPaths({ id: "menu", data: { frameworks: ["react", "solid"] } }),
  ).toEqual([
    { framework: "react", route: undefined, path: "react/previews/menu" },
    { framework: "solid", route: undefined, path: "solid/previews/menu" },
  ]);
});

test("lists the index path before every route path", () => {
  expect(
    getPreviewPaths({
      id: "gallery",
      data: { frameworks: ["astro"], routes: ["button", "nav"] },
    }),
  ).toEqual([
    { framework: "astro", route: undefined, path: "astro/previews/gallery" },
    {
      framework: "astro",
      route: "button",
      path: "astro/previews/gallery/button",
    },
    { framework: "astro", route: "nav", path: "astro/previews/gallery/nav" },
  ]);
});
