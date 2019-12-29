import * as React from "react";

/**
 * `React.useLayoutEffect` that fallbacks to `React.useEffect` on server side
 * rendering.
 */
export const useIsomorphicEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
