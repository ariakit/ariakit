"use client";
import type { HovercardProps } from "@ariakit/react";
import { Hovercard, HovercardArrow } from "@ariakit/react";
import Link from "next/link.js";
import type { ReactNode } from "react";
import { isValidElement, useContext, useMemo, useRef } from "react";
import { twJoin } from "tailwind-merge";
import invariant from "tiny-invariant";
import { useSubscription } from "@/lib/use-subscription.ts";
import { Command } from "./command.tsx";
import { PageHovercardContext } from "./page-hovercard-context.tsx";
import { Popup } from "./popup.tsx";

export { PageHovercardProvider } from "./page-hovercard-context.tsx";

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
      if (!isValidElement<{ id?: string; children?: ReactNode }>(currentNode)) {
        continue;
      }
      if (currentNode.props.id === id) return currentNode;
      queue.push(currentNode.props.children);
    }
  }

  return null;
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
  const url = new URL(href || "", "https://ariakit.com");
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
        <Popup
          render={props.render}
          arrow={<HovercardArrow />}
          scroller={<div className="gap-4" />}
        />
      }
    >
      <PageHovercardContext.Provider value={null}>
        {subscribed ? (
          content
        ) : (
          <div className="z-[1] flex max-w-xs flex-col">
            <h3 className="mb-3 text-lg font-semibold">Preview API docs</h3>
            <p className="relative after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-white dark:after:to-gray-700">
              With Ariakit Plus, you can quickly preview comprehensive API
              documentation by simply hovering over the relevant API link on our
              site.
            </p>
            <Command
              variant="plus"
              className="focus-visible:!ariakit-outline"
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
