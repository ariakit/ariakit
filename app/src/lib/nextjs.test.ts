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
  getNextjsPreviewId,
  getNextjsUrlFromRequest,
  isNextjsPreviewId,
} from "./nextjs.ts";

test.each([
  {
    name: "uses NEXTJS_PORT for localhost requests",
    requestUrl: "https://localhost/react/previews/counter-nextjs/",
    path: "/react/previews/counter-nextjs/",
    env: { NEXTJS_PORT: "4322" },
    expected: "http://localhost:4322/react/previews/counter-nextjs/",
  },
  {
    name: "uses the default port for localhost requests without NEXTJS_PORT",
    requestUrl: "http://localhost/react/previews/counter-nextjs/",
    path: "/react/previews/counter-nextjs/",
    expected: "http://localhost:3000/react/previews/counter-nextjs/",
  },
  {
    name: "maps 127.0.0.1 requests to localhost",
    requestUrl: "https://127.0.0.1/react/previews/counter-nextjs/",
    path: "/react/previews/counter-nextjs/",
    env: { NEXTJS_PORT: "4323" },
    expected: "http://localhost:4323/react/previews/counter-nextjs/",
  },
  {
    name: "maps 0.0.0.0 requests to localhost",
    requestUrl: "https://0.0.0.0/react/previews/counter-nextjs/",
    path: "/react/previews/counter-nextjs/",
    env: { NEXTJS_PORT: "4324" },
    expected: "http://localhost:4324/react/previews/counter-nextjs/",
  },
  {
    name: "maps aliased workers.dev preview requests",
    requestUrl: "https://pr-123.ariakit-preview.workers.dev/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected:
      "https://pr-123.ariakit-nextjs.workers.dev/react/previews/counter-nextjs/",
  },
  {
    name: "preserves the request protocol for aliased workers.dev requests",
    requestUrl: "http://pr-123.ariakit-preview.workers.dev/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected:
      "http://pr-123.ariakit-nextjs.workers.dev/react/previews/counter-nextjs/",
  },
  {
    name: "maps bare workers.dev preview requests",
    requestUrl: "https://ariakit-preview.workers.dev/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected:
      "https://ariakit-nextjs.workers.dev/react/previews/counter-nextjs/",
  },
  {
    name: "preserves the request protocol for bare workers.dev requests",
    requestUrl: "http://ariakit-preview.workers.dev/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected:
      "http://ariakit-nextjs.workers.dev/react/previews/counter-nextjs/",
  },
  {
    name: "maps ariakit.com requests to the production Next.js domain",
    requestUrl: "https://next.ariakit.com/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected: "https://nextjs.ariakit.com/react/previews/counter-nextjs/",
  },
  {
    name: "maps the bare ariakit.com domain to the production Next.js domain",
    requestUrl: "https://ariakit.com/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected: "https://nextjs.ariakit.com/react/previews/counter-nextjs/",
  },
  {
    name: "preserves the request protocol for ariakit.com requests",
    requestUrl: "http://next.ariakit.com/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected: "http://nextjs.ariakit.com/react/previews/counter-nextjs/",
  },
  {
    name: "maps ariakit.org requests to the production Next.js domain",
    requestUrl: "https://legacy.ariakit.org/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected: "https://nextjs.ariakit.com/react/previews/counter-nextjs/",
  },
  {
    name: "maps the bare ariakit.org domain to the production Next.js domain",
    requestUrl: "https://ariakit.org/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected: "https://nextjs.ariakit.com/react/previews/counter-nextjs/",
  },
  {
    name: "maps unknown hosts to the production Next.js domain",
    requestUrl: "https://example.com/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected: "https://nextjs.ariakit.com/react/previews/counter-nextjs/",
  },
  {
    name: "preserves the request protocol for unknown hosts",
    requestUrl: "http://example.com/react/previews/",
    path: "/react/previews/counter-nextjs/",
    expected: "http://nextjs.ariakit.com/react/previews/counter-nextjs/",
  },
  {
    name: "falls back to the production Next.js domain for malformed URLs",
    requestUrl: "://",
    path: "/react/previews/counter-nextjs/",
    expected: "https://nextjs.ariakit.com/react/previews/counter-nextjs/",
  },
  {
    name: "normalizes paths without a leading slash",
    requestUrl: "https://ariakit-preview.workers.dev/react/previews/",
    path: "react/previews/counter-nextjs/",
    expected:
      "https://ariakit-nextjs.workers.dev/react/previews/counter-nextjs/",
  },
  {
    name: "preserves shared filter state for localhost requests",
    requestUrl:
      "http://localhost:4321/react/previews/combobox-select-nextjs-app-router/?lang=fr&status=draft&status=published",
    path: "/combobox-select-nextjs-app-router",
    env: { NEXTJS_PORT: "9000" },
    expected:
      "http://localhost:9000/combobox-select-nextjs-app-router?lang=fr&status=draft&status=published",
  },
  {
    name: "preserves encoded query values",
    requestUrl:
      "http://localhost/react/previews/counter-nextjs/?q=a%20b%26c&q=%E2%9C%93",
    path: "/counter-nextjs",
    expected: "http://localhost:3000/counter-nextjs?q=a%20b%26c&q=%E2%9C%93",
  },
  {
    name: "omits an empty query",
    requestUrl: "http://localhost/react/previews/counter-nextjs/?",
    path: "/counter-nextjs",
    expected: "http://localhost:3000/counter-nextjs",
  },
  {
    name: "preserves the query for nested preview ids",
    requestUrl: "https://ariakit.com/react/previews/menu-nextjs/nested/?tab=2",
    path: "/menu-nextjs/nested",
    expected: "https://nextjs.ariakit.com/menu-nextjs/nested?tab=2",
  },
  {
    name: "preserves the query for aliased workers.dev requests",
    requestUrl:
      "https://pr-123.ariakit-preview.workers.dev/react/previews/counter-nextjs/?lang=fr",
    path: "/counter-nextjs",
    expected:
      "https://pr-123.ariakit-nextjs.workers.dev/counter-nextjs?lang=fr",
  },
  {
    name: "preserves the query for bare workers.dev requests",
    requestUrl:
      "https://ariakit-preview.workers.dev/react/previews/counter-nextjs/?lang=fr",
    path: "/counter-nextjs",
    expected: "https://ariakit-nextjs.workers.dev/counter-nextjs?lang=fr",
  },
  {
    name: "preserves the query for unknown hosts",
    requestUrl: "https://example.com/react/previews/counter-nextjs/?lang=fr",
    path: "/counter-nextjs",
    expected: "https://nextjs.ariakit.com/counter-nextjs?lang=fr",
  },
])("getNextjsUrlFromRequest $name", ({ requestUrl, path, env, expected }) => {
  expect(getNextjsUrlFromRequest({ requestUrl, path, env })).toBe(expected);
});

test("getNextjsPreviewId handles stripped preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/tab-nextjs/")).toBe("tab-nextjs");
  expect(getNextjsPreviewId("/react/previews/tab-nextjs")).toBe("tab-nextjs");
});

test("getNextjsPreviewId handles nested ids under a Next.js preview", () => {
  expect(getNextjsPreviewId("/react/previews/counter-nextjs/nested/")).toBe(
    "counter-nextjs/nested",
  );
});

test("getNextjsPreviewId ignores source path segments", () => {
  expect(
    getNextjsPreviewId("/react/previews/sandbox/counter-nextjs/"),
  ).toBeNull();
});

test("getNextjsPreviewId ignores non-Next.js preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/disclosure/")).toBeNull();
  expect(
    getNextjsPreviewId("/react/previews/counter/nested-nextjs/"),
  ).toBeNull();
});

test("isNextjsPreviewId checks the first preview id segment", () => {
  expect(isNextjsPreviewId("counter-nextjs/nested")).toBe(true);
  expect(isNextjsPreviewId("counter/nested-nextjs")).toBe(false);
});
