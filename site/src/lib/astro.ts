import mdxRenderer from "@astrojs/mdx/server.js";
import reactRenderer from "@astrojs/react/server.js";
import { experimental_AstroContainer } from "astro/container";

interface CreateContainerParams {
  renderers?: ("mdx" | "react")[];
  client?: boolean;
}

export async function createContainer(params: CreateContainerParams = {}) {
  const container = await experimental_AstroContainer.create();
  const getServerRenderer = (renderer: typeof mdxRenderer) => ({
    name: renderer.name,
    renderer: renderer,
  });
  if (params.renderers?.includes("mdx")) {
    container.addServerRenderer(getServerRenderer(mdxRenderer));
  }
  if (params.renderers?.includes("react")) {
    container.addServerRenderer(getServerRenderer(reactRenderer));
    if (params.client) {
      container.addClientRenderer({
        name: "@astrojs/react",
        entrypoint: "@astrojs/react/client.js",
      });
    }
  }
  return container;
}
