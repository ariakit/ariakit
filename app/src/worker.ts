/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import server from "@astrojs/cloudflare/entrypoints/server";
import { getNextjsPreviewId, getNextjsUrlFromRequest } from "./lib/nextjs.ts";

function getDevNextjsPort() {
  if (!import.meta.env.DEV) return;
  return import.meta.env.NEXTJS_PORT;
}

export default {
  fetch(request, env, context) {
    // Astro middleware only runs after the adapter resolves an SSR route. This
    // wrapper intercepts Next.js previews before the adapter serves 404.html.
    const nextjsExampleId = getNextjsPreviewId(new URL(request.url).pathname);

    if (nextjsExampleId) {
      const nextjsUrl = getNextjsUrlFromRequest({
        requestUrl: request.url,
        path: `/${nextjsExampleId}`,
        env: {
          NEXTJS_PORT: env.NEXTJS_PORT ?? getDevNextjsPort(),
        },
      });
      return Response.redirect(nextjsUrl, 307);
    }

    return server.fetch(request, env, context);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
