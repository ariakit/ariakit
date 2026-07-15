/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { CollectionEntry, CollectionKey } from "astro:content";
import { getCollection } from "astro:content";

const collectionCache = new Map<
  CollectionKey,
  Promise<CollectionEntry<CollectionKey>[]>
>();

/**
 * Returns a content collection, cached for the lifetime of the process
 * during production builds. `getCollection` materializes fresh entry objects
 * on every call, and components such as code blocks, content links, and page
 * cards read collections on every render — thousands of times across
 * reference partial pages. Reusing one promise also keeps entry object
 * identities stable, which lets downstream WeakMap-based memoization hit
 * across pages. In dev, the collection is re-read on every call so content
 * updates are picked up. Callers must not mutate the returned array; use
 * `array.filter()` and friends to derive filtered views.
 */
export function getCachedCollection<C extends CollectionKey>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  if (import.meta.env.DEV) {
    return getCollection(collection);
  }
  let promise = collectionCache.get(collection);
  if (!promise) {
    promise = getCollection(collection);
    collectionCache.set(collection, promise);
  }
  // The cache maps each collection name to entries of that same collection;
  // the assertion only restores the per-key type the Map cannot express.
  return promise as Promise<CollectionEntry<C>[]>;
}
