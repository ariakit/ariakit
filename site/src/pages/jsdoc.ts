import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const references = await getCollection("references");

  // Group by framework
  const byFramework = references.reduce(
    (acc, ref) => {
      const framework = ref.data.framework;
      if (!acc[framework]) acc[framework] = [];
      acc[framework].push(ref.data);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  // Group by component
  const byComponent = references.reduce(
    (acc, ref) => {
      const componentId = ref.data.componentId;
      if (!acc[componentId]) acc[componentId] = [];
      acc[componentId].push(ref.data);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const frameworks = Object.keys(byFramework).sort();
  const componentIds = Object.keys(byComponent).sort();
  const totalRefs = references.length;

  const stats = {
    totalReferences: totalRefs,
    frameworks: frameworks.map((framework) => ({
      name: framework,
      count: byFramework[framework]?.length || 0,
    })),
    components: componentIds.map((componentId) => {
      const refs = byComponent[componentId] || [];
      const hooks = refs.filter((r) => r.kind === "hook");
      const components = refs.filter((r) => r.kind === "component");
      const types = refs.filter((r) => r.kind === "type");
      const stores = refs.filter((r) => r.kind === "store");

      return {
        name: componentId,
        totalExports: refs.length,
        hooks: hooks.length,
        components: components.length,
        types: types.length,
        stores: stores.length,
      };
    }),
  };

  const response = {
    stats,
    byFramework,
    byComponent,
    allReferences: references.map((ref) => ref.data),
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
