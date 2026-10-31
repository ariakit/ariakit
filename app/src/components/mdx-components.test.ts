/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { mdxComponents } from "./mdx-components.react.tsx";

test("a mapped ordered list starts its marker counter at start", () => {
  const html = renderToStaticMarkup(
    createElement(mdxComponents.ol, { start: "3" }),
  );
  expect(html).toContain('start="3"');
  expect(html).toContain("counter-reset:list 2");
});

test("a mapped ordered list keeps the default counter without start", () => {
  const html = renderToStaticMarkup(createElement(mdxComponents.ol));
  expect(html).not.toContain("start=");
  expect(html).not.toContain("counter-reset:list ");
});
