import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getReferencePath } from "#app/lib/url.ts";

export const GET: APIRoute = async () => {
  const references = await getCollection("references");
  const paths = references.map((reference) => getReferencePath({ reference }));

  return Response.json(paths);
};
