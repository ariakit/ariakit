import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
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

export async function getOGImageItem({
  type = "pages",
  framework,
  id,
}: GetOGImageItemParams) {
  const items = await getOGImageItems();
  return items.find(
    (item) =>
      item.type === type && item.framework === framework && item.id === id,
  );
}

export async function getOGImageItems(): Promise<OGImageItem[]> {
  const entries = await getCollection("examples");
  const examples = entries.flatMap((entry) => {
    const type = entry.data.component ? "components" : "examples";
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

  const exampleEntries = entries.filter((entry) => !entry.data.component);
  const exampleIndexes = uniq(
    exampleEntries.flatMap((entry) => entry.data.frameworks),
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
    entries.flatMap((entry) =>
      entry.data.component ? entry.data.frameworks : [],
    ),
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
    ...examples,
    ...guidePages,
    ...exampleIndexes,
    ...componentIndexes,
    ...genericPages,
  ];
}

export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) {
    return Response.json([]);
  }
  return Response.json(await getOGImageItems());
};
