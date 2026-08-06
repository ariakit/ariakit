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
 * Caches production collection reads so repeated reference renders share entry
 * identities and downstream WeakMap caches. Development reads stay uncached.
 * Treat the returned array as read-only.
 *
 * See https://github.com/ariakit/ariakit/pull/6289
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
