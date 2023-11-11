"use client";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type {
  HovercardAnchorProps,
  HovercardProps,
  HovercardProviderProps,
  HovercardStore,
} from "@ariakit/react";
import { Hovercard, HovercardAnchor, useHovercardStore } from "@ariakit/react";
import invariant from "tiny-invariant";

const PageHovercardContext = createContext<HovercardStore | null>(null);

export interface PageHovercardProviderProps extends HovercardProviderProps {}

export function PageHovercardProvider({
  children,
  ...props
}: PageHovercardProviderProps) {
  const store = useHovercardStore(props);
  return (
    <PageHovercardContext.Provider value={store}>
      {children}
    </PageHovercardContext.Provider>
  );
}

export interface PageHovercardProps extends HovercardProps {
  contents?: Record<string, ReactNode>;
}

export function PageHovercard({
  contents,
  children,
  ...props
}: PageHovercardProps) {
  const store = useContext(PageHovercardContext);
  invariant(store);
  const href = store.useState("anchorElement")?.getAttribute("href");

  return (
    <Hovercard store={store} {...props}>
      {(href && contents && href in contents && contents[href]) || children}
    </Hovercard>
  );
}

export interface PageHovercardAnchorProps extends HovercardAnchorProps {}

export function PageHovercardAnchor(props: PageHovercardAnchorProps) {
  const store = useContext(PageHovercardContext);
  invariant(store);
  return <HovercardAnchor store={store} {...props} />;
}
