import type { HighlightResult } from "@ariakit/ui/utils/highlight.server";
import { queryOptions } from "@tanstack/react-query";

/** A file that the page knows about, but loads only when it shows. */
export interface CodeFileInfo {
  name: string;
  /** The URL of the JSON file with the result of `highlight`. */
  url: string;
  /** The number of lines, so the placeholder can take the final height. */
  lines: number;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCodeFile(url: string, delay: number) {
  if (delay > 0) {
    await wait(delay);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Couldn't load ${url}: ${response.status}`);
  }
  const file: HighlightResult = await response.json();
  return file;
}

/**
 * Returns the query of a file, for `useSuspenseQuery` in a panel, or for
 * `prefetchQuery` in an event handler to start the request early. The file
 * never goes stale or leaves the cache, so it loads once and stays loaded when
 * its tab changes. `delay` is the milliseconds to wait before the request, such
 * as to show the loading state on a fast network.
 */
export function codeFileQuery(url: string, delay = 0) {
  return queryOptions({
    // The delay only simulates a slow network, so it isn't part of the key, and
    // a change of the delay doesn't load the files again.
    queryKey: ["code-file", url],
    queryFn: () => fetchCodeFile(url, delay),
    staleTime: Infinity,
    // A hidden panel doesn't read its file, which would leave the cache after 5
    // minutes by default.
    gcTime: Infinity,
    // A failed request shows a button that tries again.
    retry: false,
  });
}
