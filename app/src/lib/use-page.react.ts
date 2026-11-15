/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { useCallback, useSyncExternalStore } from "react";
import { getLinkPathname } from "#app/lib/app.ts";

// An island that stays across pages gets the props of the next page at a time
// that React chooses, since it renders them with a low priority. These hooks
// read the page instead, so the island changes with it.

function getServerSnapshot() {
  return null;
}

function subscribeToSwap(onChange: () => void) {
  document.addEventListener("astro:after-swap", onChange);
  return () => document.removeEventListener("astro:after-swap", onChange);
}

function getPathname() {
  return getLinkPathname(window.location.pathname);
}

/**
 * Returns the path of the page that shows, as links write it, or `null` on the
 * server. It changes as soon as the client router shows the next page.
 */
export function usePathname() {
  return useSyncExternalStore(subscribeToSwap, getPathname, getServerSnapshot);
}

interface PageData {
  element: HTMLElement | null;
  value: unknown;
}

// The data of each element, which stays the same value while its page shows.
const pageData = new Map<string, PageData>();

function getPageData(id: string) {
  const element = document.getElementById(id);
  const data = pageData.get(id);
  if (data && data.element === element) return data.value;
  let value: unknown = null;
  try {
    value = element ? JSON.parse(element.textContent) : null;
  } catch {
    // The island keeps its props without the data.
  }
  pageData.set(id, { element, value });
  return value;
}

/**
 * Returns the JSON data that the page that shows holds in the script element
 * with the given id, or `null` on the server and on a page without the element.
 * Pass a function that tells whether the data has the expected type. The data
 * changes as soon as the client router shows the next page.
 */
export function usePageData<T>(
  id: string,
  isData: (value: unknown) => value is T,
) {
  const getSnapshot = useCallback(() => getPageData(id), [id]);
  const value = useSyncExternalStore(
    subscribeToSwap,
    getSnapshot,
    getServerSnapshot,
  );
  return isData(value) ? value : null;
}
