/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getReferenceItems } from "#app/lib/reference.ts";
import { getReferencePath, referenceURLToPartialPath } from "#app/lib/url.ts";

export const GET: APIRoute = async () => {
  const references = await getCollection("references");

  const paths = new Set<string>();

  for (const reference of references) {
    const fullPath = getReferencePath({ reference });
    if (!fullPath) continue;
    paths.add(referenceURLToPartialPath(fullPath));
    const items = getReferenceItems(reference.data);
    for (const item of items) {
      const itemPath = getReferencePath({ reference, item: item.id });
      if (!itemPath) continue;
      paths.add(referenceURLToPartialPath(itemPath));
    }
  }

  return Response.json(Array.from(paths).sort());
};
