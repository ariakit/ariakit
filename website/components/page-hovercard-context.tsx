"use client";

import type { HovercardProviderProps, HovercardStore } from "@ariakit/react";
import { useHovercardStore } from "@ariakit/react";
import { createContext } from "react";

export const PageHovercardContext = createContext<HovercardStore | null>(null);

export interface PageHovercardProviderProps extends HovercardProviderProps {}

export function PageHovercardProvider({
  children,
  placement = "top-start",
  showTimeout = 500,
  hideTimeout = 250,
  ...props
}: PageHovercardProviderProps) {
  const store = useHovercardStore({
    placement,
    showTimeout,
    hideTimeout,
    ...props,
  });
  return (
    <PageHovercardContext.Provider value={store}>
      {children}
    </PageHovercardContext.Provider>
  );
}
