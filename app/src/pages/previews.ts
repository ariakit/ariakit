import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPreviewIndexPaths } from "../lib/preview-index.ts";

export const GET: APIRoute = async () => {
  const entries = await getCollection("previews");
  const paths = getPreviewIndexPaths(entries);
  return Response.json(paths);
};
