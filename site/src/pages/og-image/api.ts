import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { uniq } from "#app/lib/array.ts";
import { trim } from "#app/lib/string.ts";

function getImagePath(path: string) {
  return `/og-image/${trim(path, "/").replaceAll("/", "_")}.png`;
}

export interface OGImageItem {
  type: "page" | "examples" | "components";
  path: string;
  imagePath: string;
  id?: string;
  title?: string;
  framework?: Framework;
}

interface GetOGImageItemParams {
  id?: OGImageItem["id"];
  type?: OGImageItem["type"];
  framework?: OGImageItem["framework"];
}

export async function getOGImageItem({
  type = "page",
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
  if (import.meta.env.PROD) {
    return [];
  }
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
      type: "page",
    },
    {
      path: "/changelog",
      imagePath: getImagePath("/changelog"),
      type: "page",
      title: "Changelog",
    },
  ] satisfies OGImageItem[];

  return [...examples, ...exampleIndexes, ...componentIndexes, ...genericPages];
}

export const GET: APIRoute = async () => {
  return Response.json(await getOGImageItems());
};
