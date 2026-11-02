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

// A render error after Astro commits a streamed response would reach workerd,
// which ends the body cleanly and drops the queued chunks. The result is a blank
// 200. Awaiting the HTML in dev rejects first, so Vite can show its overlay.
async function bufferDevHtml(response: Response) {
  if (!response.body) return response;
  const contentType = response.headers.get("content-type");
  if (!contentType?.startsWith("text/html")) return response;
  return new Response(await response.arrayBuffer(), response);
}

export default {
  async fetch(request, env, context) {
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

    const response = await server.fetch(request, env, context);
    if (!import.meta.env.DEV) return response;
    return bufferDevHtml(response);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
