/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { mdxComponents } from "./mdx-components.react.tsx";

const { a: A } = mdxComponents;

function renderLink(href: string, props: Record<string, string> = {}) {
  const container = renderToStaticMarkup(
    <A href={href} {...props}>
      Link
    </A>,
  );
  const target = container.match(/target="([^"]*)"/)?.[1] ?? null;
  const rel = container.match(/rel="([^"]*)"/)?.[1] ?? null;
  return { target, rel };
}

test("external links open in a new tab with safe rel", () => {
  const expected = { target: "_blank", rel: "noopener noreferrer" };
  expect(renderLink("https://www.w3.org/WAI/ARIA/apg/")).toEqual(expected);
  expect(renderLink("http://example.com")).toEqual(expected);
  expect(renderLink("HTTPS://EXAMPLE.COM")).toEqual(expected);
  expect(renderLink("//example.com/path")).toEqual(expected);
});

test("internal and non-http links keep default attributes", () => {
  const expected = { target: null, rel: null };
  expect(renderLink("/components/dialog")).toEqual(expected);
  expect(renderLink("./dialog")).toEqual(expected);
  expect(renderLink("#usage")).toEqual(expected);
  expect(renderLink("mailto:hello@ariakit.org")).toEqual(expected);
});

test("explicit props override external link defaults", () => {
  expect(
    renderLink("https://example.com", { target: "_self", rel: "nofollow" }),
  ).toEqual({ target: "_self", rel: "nofollow" });
});
