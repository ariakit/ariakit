/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { uniq } from "#app/lib/array.ts";
import { getGuideDetail } from "#app/lib/content.ts";
import { trim } from "#app/lib/string.ts";

const types = ["pages", "examples", "components", "styles"] as const;

function getImagePath(path: string) {
  return `/og-image/${trim(path, "/").replaceAll("/", "_")}.png`;
}

export interface OGImageItem {
  type: (typeof types)[number];
  path: string;
  imagePath: string;
  id?: string;
  title?: string;
  framework?: Framework;
}

export interface GetOGImageItemParams {
  id?: OGImageItem["id"];
  type?: OGImageItem["type"];
  framework?: OGImageItem["framework"];
}

let ogImageItemsPromise: Promise<OGImageItem[]> | undefined;
let ogImageItemMapPromise: Promise<Map<string, OGImageItem>> | undefined;

function getOGImageItemKey({
  type = "pages",
  framework,
  id,
}: GetOGImageItemParams) {
  return `${type}|${framework ?? ""}|${id ?? ""}`;
}

async function getOGImageItemMap(): Promise<Map<string, OGImageItem>> {
  ogImageItemMapPromise ??= getOGImageItems().then((items) => {
    const itemMap = new Map<string, OGImageItem>();
    for (const item of items) {
      const key = getOGImageItemKey(item);
      if (itemMap.has(key)) continue;
      itemMap.set(key, item);
    }
    return itemMap;
  });
  return ogImageItemMapPromise;
}

export async function getOGImageItem({
  type = "pages",
  framework,
  id,
}: GetOGImageItemParams) {
  const itemMap = await getOGImageItemMap();
  return itemMap.get(getOGImageItemKey({ type, framework, id }));
}

async function computeOGImageItems(): Promise<OGImageItem[]> {
  const components = await getCollection("components");
  const examples = await getCollection("examples");
  const entries = [...components, ...examples];
  const items = entries.flatMap((entry) => {
    const type = entry.collection;
    const frameworks = entry.data.frameworks;
    const path = `/${type}/${entry.id}`;
    return frameworks.map((framework) => {
      return {
        path: `/${framework}${path}`,
        imagePath: getImagePath(`${framework}${path}`),
        type,
        framework,
        id: entry.id,
        title: entry.data.title,
      } as const;
    });
  });

  const guides = await getCollection("guides");
  const guidePages = guides.map((guide) => {
    const { type, data, framework, id, path } = getGuideDetail(guide);
    return {
      path,
      type,
      imagePath: getImagePath(path),
      title: data.title,
      framework,
      id,
    } as const;
  });

  const exampleIndexes = uniq(
    items
      .filter((item) => item.type === "examples")
      .flatMap((item) => item.framework),
  ).map((framework) => {
    const path = "/examples";
    return {
      path: `/${framework}${path}`,
      imagePath: getImagePath(`/${framework}${path}`),
      type: "examples",
      framework,
    } as const;
  });

  const componentIndexes = uniq(
    items
      .filter((item) => item.type === "components")
      .flatMap((item) => item.framework),
  ).map((framework) => {
    const path = "/components";
    return {
      path: `/${framework}${path}`,
      imagePath: getImagePath(`/${framework}${path}`),
      type: "components",
      framework,
    } as const;
  });

  const genericPages = [
    {
      path: "/",
      imagePath: getImagePath("/default"),
      type: "pages",
    },
    {
      path: "/changelog",
      imagePath: getImagePath("/changelog"),
      type: "pages",
      title: "Changelog",
    },
  ] satisfies OGImageItem[];

  return [
    ...items,
    ...guidePages,
    ...exampleIndexes,
    ...componentIndexes,
    ...genericPages,
  ];
}

export function getOGImageItems(): Promise<OGImageItem[]> {
  ogImageItemsPromise ??= computeOGImageItems();
  return ogImageItemsPromise;
}

export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) {
    return Response.json([]);
  }
  return Response.json(await getOGImageItems());
};
