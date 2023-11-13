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
import Link from "next/link.js";
import { twJoin } from "tailwind-merge";
import invariant from "tiny-invariant";
import { useSubscription } from "utils/use-subscription.js";
import { Command } from "./command.jsx";
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
  const store = useContext(PageHovercardContext);
  invariant(store);

  const sub = useSubscription();
  const ref = useRef<HTMLDivElement>(null);
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
  if (!sub.isLoaded) return null;
  if (sub.userId && !sub.isFetched) return null;

  const subscribed = !!sub.data;

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
        {subscribed ? (
          content
        ) : (
          <div className="flex max-w-xs flex-col">
            <h3 className="mb-3 text-lg font-semibold">Preview API docs</h3>
            <p className="relative after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-white dark:after:to-gray-700">
              With Ariakit Plus, you can quickly preview comprehensive API
              documentation by simply hovering over the relevant API link on our
              site.
            </p>
            <Command
              variant="plus"
              render={<Link href="/plus?feature=preview-docs" scroll={false} />}
            >
              <span>
                Unlock <span className="font-semibold">Ariakit Plus</span>
              </span>
            </Command>
          </div>
        )}
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
          "[[data-dialog]_&]:decoration-solid [[data-dialog]_&]:decoration-[0.5px] [[data-dialog]_&]:hover:decoration-2",
        )}
      />
    );
  }
  return <HovercardAnchor store={store} {...props} />;
}
