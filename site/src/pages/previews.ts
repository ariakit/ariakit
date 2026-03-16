import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const entries = await getCollection("previews");
  const paths = entries.flatMap((entry) =>
    entry.data.frameworks.map(
      (framework) => `/${framework}/previews/${entry.id}`,
    ),
  );
  return Response.json(paths);
};
