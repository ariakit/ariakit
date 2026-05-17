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
import { descriptionToText } from "./content.ts";

test("descriptionToText extracts text from description markdown", async () => {
  const body = `
import ContentLink from "#app/components/content-link.astro";

Build **accessible** {getFramework(props.framework).label} components with <ContentLink href="/react">Ariakit</ContentLink>.
`;

  await expect(descriptionToText(body, "react")).resolves.toBe(
    "Build accessible React components with Ariakit.",
  );
});

test("descriptionToText returns only the first text block", async () => {
  const body = `
First paragraph.

Second paragraph.
`;

  await expect(descriptionToText(body, "react")).resolves.toBe(
    "First paragraph.",
  );
});
