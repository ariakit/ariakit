/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { join, posix, relative, sep } from "node:path";
import cloudflare from "@astrojs/cloudflare";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { Features } from "lightningcss";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { previewConfig } from "./src/lib/preview-config.ts";
import { resolvePreviewRoots } from "./src/lib/preview-discovery.ts";
import { previewIntegration } from "./src/lib/preview-integration.ts";
import { rehypeHtmlComponents } from "./src/lib/rehype.ts";
import { remarkCodeFences } from "./src/lib/remark-code-fence.server.ts";
import { remarkGalleryExamples } from "./src/lib/remark-gallery.ts";
import { remarkPreviewFences } from "./src/lib/remark-preview-fence.ts";
import { sourcePlugin } from "./src/lib/source.ts";

const port = Number(process.env.APP_PORT) || 4321;
const inspectorPort = Number(process.env.APP_INSPECTOR_PORT) || 0;
const viteCacheDir = process.env.APP_VITE_CACHE_DIR;
const srcDir = join(import.meta.dirname, "src");
const previewRoots = resolvePreviewRoots({ ...previewConfig, srcDir });

// The MDX of guides, recipes, component pages, and Styles pages renders in the
// main body. Descriptions, galleries, and previews render elsewhere. These
// patterns follow the loaders in content.config.ts.
const bodyContentPatterns = [
  "guides/*/*.mdx",
  "recipes/*/index.mdx",
  "docs/components/*/index.mdx",
  "docs/styles/{guides,utilities}/*/index.mdx",
];

function isBodyContent(filePath: string) {
  const path = relative(srcDir, filePath).split(sep).join("/");
  return bodyContentPatterns.some((pattern) =>
    posix.matchesGlob(path, pattern),
  );
}

// https://astro.build/config
export default defineConfig({
  site:
    process.env.NODE_ENV === "production"
      ? "https://next.ariakit.com"
      : `http://localhost:${port}`,

  srcDir: "src",

  server: {
    port,
    host: true,
    allowedHosts: true,
  },

  devToolbar: {
    enabled: false,
  },

  adapter: cloudflare({
    imageService: "compile",
    inspectorPort,
  }),

  build: {
    // Prerendering thousands of reference partial pages is the bulk of the
    // build. Rendering a few pages concurrently overlaps their async work
    // (collection reads, markdown rendering, file writes) without exhausting
    // memory on CI runners.
    concurrency: 4,
  },

  vite: {
    css: {
      lightningcss: {
        // Lowering :dir() to :lang() ignores explicit and inherited dir values.
        // Keep the native selector so production layout follows HTML direction.
        exclude: Features.DirSelector,
      },
    },
    // TODO: Remove this workaround once Astro isolates optimizer cache writes.
    // Isolate check/sync/dev optimizer writes so a concurrent check or lint
    // cannot invalidate the dev server's SSR modules.
    // https://github.com/ariakit/ariakit/pull/6418
    cacheDir: viteCacheDir,
    build: {
      // Perf CI enables this so CDP script profiles can resolve source maps.
      sourcemap: process.env.PERF_SOURCE_MAP === "true",
    },
    plugins: [tailwindcss(), sourcePlugin(previewRoots)],
    // TODO: Remove this workaround once withastro/astro#17166 is fixed.
    // Pre-optimize bare SSR imports so the Cloudflare adapter cannot reload
    // React mid-request.
    // https://github.com/withastro/astro/issues/17166
    optimizeDeps: {
      include: [
        "astro/virtual-modules/transitions.js",
        "astro/app/manifest",
        "astro/zod",
      ],
    },
  },

  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins: [
        [remarkGalleryExamples, { roots: previewRoots, srcDir }],
        // The preview plugin removes its word from the info string, which the
        // code fence plugin would report as an unknown option.
        remarkPreviewFences,
        // An example card goes in a popout, like the code fences. A page names
        // each figure that it imports with a Figure suffix, such as
        // ConcentricRadiusFigure, so the figure gets a wider feature band.
        [
          remarkCodeFences,
          { isBodyContent, popouts: ["ExampleCard"], features: [/Figure$/] },
        ],
      ],
      rehypePlugins: [
        rehypeHtmlComponents,
        rehypeHeadingIds,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ],
    }),
  },

  integrations: [
    previewIntegration(previewConfig),
    react({ include: ["**/*.react.*", "../packages/*react*/**"] }),
    solid({ include: ["**/*.solid.*", "../packages/*solid*/**"] }),
    mdx({ extendMarkdownConfig: true }),
  ],
});
