/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { render } from "@ariakit/test/react";
import { createElement, Suspense } from "react";
import type { ComponentType } from "react";
import { beforeEach } from "vitest";

/**
 * Mounts a page's examples component before each test in the file.
 *
 * An `index.astro` entry renders islands from several modules and cannot render
 * in happy-dom, so the automatic mount that `vitest.setup.framework.ts`
 * performs for `index.react.tsx` entries does not apply here. This is the
 * explicit equivalent, with the same strict mode and Suspense boundary.
 */
export function mountExamples(Examples: ComponentType) {
  beforeEach(async () => {
    const element = createElement(
      Suspense,
      { fallback: null },
      createElement(Examples),
    );
    const { unmount } = await render(element, { strictMode: true });
    return unmount;
  });
}
