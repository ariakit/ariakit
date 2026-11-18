/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { invariant } from "@ariakit/utils";

/** The path of the Styles section, which documents `@ariakit/tailwind`. */
export const STYLES_PATH = "/tailwind/styles/";

/** The groups of the Styles section, in the order of the site navigation. */
export const STYLE_GROUPS = [
  { id: "guides", label: "Guides" },
  { id: "utilities", label: "Utilities" },
] as const;

export type StyleGroupId = (typeof STYLE_GROUPS)[number]["id"];

/** The parts of a Styles page that the section needs for its order and path. */
export interface StylePageEntry {
  id: string;
  data: { title: string; order: number };
}

export interface StylePage<T extends StylePageEntry = StylePageEntry> {
  entry: T;
  group: StyleGroupId;
  slug: string;
  path: string;
}

function isStyleGroupId(value: string): value is StyleGroupId {
  return STYLE_GROUPS.some((group) => group.id === value);
}

function getGroupIndex(group: StyleGroupId) {
  return STYLE_GROUPS.findIndex((item) => item.id === group);
}

/**
 * Returns the group, slug, and path of a Styles page from its collection id,
 * such as `utilities/ak-layer`.
 */
export function getStylePage<T extends StylePageEntry>(entry: T): StylePage<T> {
  const [group, slug, ...rest] = entry.id.split("/");
  invariant(
    group && isStyleGroupId(group),
    `Invalid Styles group: ${entry.id}`,
  );
  invariant(slug && !rest.length, `Invalid Styles page id: ${entry.id}`);
  return { entry, group, slug, path: `${STYLES_PATH}${slug}/` };
}

/**
 * Returns the Styles pages in navigation order: by group, then by the `order`
 * of each page, then by title. Guides and utilities share one URL namespace, so
 * this throws when two pages have the same slug.
 */
export function getStylePages<T extends StylePageEntry>(entries: T[]) {
  const pages = entries.map(getStylePage);
  const paths = new Map<string, string>();
  for (const page of pages) {
    const other = paths.get(page.path);
    invariant(
      !other,
      `The Styles pages ${other} and ${page.entry.id} share the path ${page.path}`,
    );
    paths.set(page.path, page.entry.id);
  }
  return pages.toSorted((a, b) => {
    const groupOrder = getGroupIndex(a.group) - getGroupIndex(b.group);
    const pageOrder = a.entry.data.order - b.entry.data.order;
    return (
      groupOrder ||
      pageOrder ||
      a.entry.data.title.localeCompare(b.entry.data.title)
    );
  });
}
