import * as React from "react";

export interface LandmarkContextValue {
  /** Whether an ancestor already renders a navigation landmark. */
  navigation: boolean;
  /** Whether an ancestor `ShellMain` already renders the main area. */
  main: boolean;
}

/**
 * The landmarks that Ariakit UI ancestors already render, so nested parts can
 * skip a duplicate. Like any context, it doesn't cross separate React roots,
 * such as Astro islands, where parts need an explicit `landmark` prop.
 */
export const LandmarkContext = React.createContext<LandmarkContextValue>({
  navigation: false,
  main: false,
});

/**
 * Returns the landmark context value for descendants, adding the landmarks that
 * the current part provides to the ones its ancestors provide.
 */
export function useNestedLandmarks(
  inherited: LandmarkContextValue,
  provided: Partial<LandmarkContextValue>,
) {
  const navigation = inherited.navigation || !!provided.navigation;
  const main = inherited.main || !!provided.main;
  return React.useMemo(() => ({ navigation, main }), [navigation, main]);
}
