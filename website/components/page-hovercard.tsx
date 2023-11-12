"use client";
import {
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useRef,
} from "react";
import type { ReactNode } from "react";
import type {
  HovercardAnchorProps,
  HovercardProps,
  HovercardProviderProps,
  HovercardStore,
} from "@ariakit/react";
import {
  Hovercard,
  HovercardAnchor,
  HovercardArrow,
  Role,
  useHovercardStore,
} from "@ariakit/react";
import { twJoin } from "tailwind-merge";
import invariant from "tiny-invariant";
import { Popup } from "./popup.jsx";

// Breadth-first search algorithm
function findSection(node: ReactNode, id?: string | null): ReactNode {
  if (!id) return node;
  const queue = [node];

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i += 1) {
      const currentNode = queue.shift();
      if (Array.isArray(currentNode)) {
        queue.push(...currentNode);
        continue;
      }
      if (!isValidElement(currentNode)) continue;
      if (currentNode.props.id === id) return currentNode;
      queue.push(currentNode.props.children);
    }
  }

  return null;
}

const PageHovercardContext = createContext<HovercardStore | null>(null);

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

export interface PageHovercardProps extends HovercardProps {
  contents?: Record<string, ReactNode>;
}

export function PageHovercard({ contents, ...props }: PageHovercardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const store = useContext(PageHovercardContext);
  invariant(store);
  const href = store.useState("anchorElement")?.getAttribute("href");
  const url = new URL(href || "", "https://ariakit.org");
  const [, , page] = url.pathname.split("/");
  const id = url.hash.slice(1);

  const content = useMemo(() => {
    if (!contents) return;
    if (!page) return;
    const content = contents[page];
    if (!content) return;
    if (!id) return content;
    return findSection(content, id);
  }, [contents, page, id]);

  if (!content) return null;

  return (
    <Hovercard
      store={store}
      ref={ref}
      portal
      shift={-8}
      unmountOnHide
      {...props}
      className={twJoin("max-h-96 max-w-md", props.className)}
      render={
        <Popup render={props.render} scroller={<div className="gap-4" />} />
      }
    >
      <HovercardArrow />
      <PageHovercardContext.Provider value={null}>
        {content}
      </PageHovercardContext.Provider>
    </Hovercard>
  );
}

export interface PageHovercardAnchorProps extends HovercardAnchorProps {}

export function PageHovercardAnchor(props: PageHovercardAnchorProps) {
  const store = useContext(PageHovercardContext);
  if (!store) {
    return (
      <Role.a
        {...props}
        className={twJoin(
          props.className,
          "[[data-dialog]_&]:decoration-solid [[data-dialog]_&]:decoration-[0.5px]",
        )}
      />
    );
  }
  return <HovercardAnchor store={store} {...props} />;
}
