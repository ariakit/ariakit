"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@ariakit/core/utils/misc";
import * as Ariakit from "@ariakit/react";
import type { TableOfContents as Data } from "build-pages/types.js";
import { Popup } from "components/popup.js";
import { List } from "icons/list.js";
import Link from "next/link.js";
import { tw } from "utils/tw.js";
import { useMedia } from "utils/use-media.js";

interface Props {
  data: Data;
}

const padding: Record<number, string> = {
  0: tw`pl-0`,
  1: tw`pl-3`,
  2: tw`pl-6`,
  3: tw`pl-9`,
  4: tw`pl-12`,
  5: tw`pl-15`,
  6: tw`pl-18`,
};

const style = {
  stickyWrapper: tw`
    sticky top-[72px] z-30 mt-8 flex h-0 w-full justify-end px-3
    md:hidden
  `,
  disclosure: tw`
    flex h-10 w-10 items-center justify-center
    bg-transparent rounded-lg
    hover:bg-black/5 dark:hover:bg-white/5
    aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10
    [&:focus-visible]:ariakit-outline-input
  `,
  popover: tw`
    min-w-[280px] max-w-[calc(100vw-24px)]
  `,
  popoverHeading: tw`
    font-medium text-black/60 dark:text-white/50 px-2 pt-2
  `,
  nav: tw`
    hidden md:flex m-4 max-h-[calc(100vh-theme(spacing.36))]
    w-[224px] flex-col gap-4 overflow-auto border-l
  border-black/10 p-3 dark:border-white/10 md:sticky
    md:top-32
  `,
  list: tw`
    flex flex-col md:text-sm md:leading-8 text-black/90 dark:text-white/80
    md:text-black/80 md:dark:text-white/70 p-2 md:p-0
  `,
  subList: tw`
    flex flex-col
  `,
  listItem: tw`
    flex flex-col
  `,
  link: tw`
    group flex items-center gap-1 rounded-sm min-h-[40px] md:min-h-0
    underline-offset-[0.2em] hover:text-black focus-visible:ariakit-outline-input
    dark:hover:text-white
  `,
  linkText: tw`
    md:truncate [@media(any-hover:hover)]:group-hover:underline

    group-aria-[current]:font-semibold group-aria-[current]:tracking-[-0.006em]
    group-aria-[current]:text-black dark:group-aria-[current]:font-medium
    dark:group-aria-[current]:tracking-[-0.004em]
    dark:group-aria-[current]:text-blue-400
  `,
  slash: tw`
    w-2 flex-none text-base font-semibold opacity-40 hidden md:block
  `,
};

function getDataIds(data: Data): string[] {
  return data
    .slice()
    .reverse()
    .flatMap((item) => {
      if (item.children) {
        return [...getDataIds(item.children), item.id];
      }
      if (item.id) {
        return item.id;
      }
      return [];
    });
}

export function TableOfContents({ data }: Props) {
  const isLarge = useMedia("(min-width: 768px)", true);
  const popover = Ariakit.usePopoverStore({
    fixed: true,
    gutter: 8,
    overflowPadding: 12,
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ids = getDataIds(data);

    const nav = ref.current;
    if (!nav) return;

    const spans = nav.querySelectorAll("span");

    spans.forEach((span) => {
      if (span.offsetWidth >= span.scrollWidth) return;
      if (!span.textContent) return;
      if (!span.parentElement) return;
      span.parentElement.title = span.textContent;
    });

    const onScroll = () => {
      const activeId = ids.find((id) => {
        const element = document.getElementById(id);
        if (!element) return false;
        const { top } = element.getBoundingClientRect();
        const { scrollMarginTop } = getComputedStyle(element);
        return top - parseInt(scrollMarginTop) <= 0;
      });
      setActiveId(activeId ?? null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [data]);

  const renderTableOfContents = (data: Data, depth = 0) =>
    data.map((item, i) => {
      if (i === 0 && depth === 0 && !isLarge) return null;
      const Component = item.id ? "a" : Link;
      const active =
        (activeId && item.id === activeId) ||
        (item.children && !item.id && !activeId);
      return (
        <li key={item.href} className={style.listItem}>
          <Component
            href={item.href}
            className={cx(padding[depth], style.link)}
            aria-current={active || undefined}
          >
            {!item.id && (
              <span aria-hidden className={style.slash}>
                /
              </span>
            )}
            <span className={style.linkText}>{item.text}</span>
          </Component>
          {item.children && (
            <ul className={style.subList}>
              {renderTableOfContents(
                item.children,
                isLarge ? depth + 1 : depth + 2
              )}
            </ul>
          )}
        </li>
      );
    });

  return (
    <>
      {isLarge && (
        <nav ref={ref} className={style.nav}>
          <ul className={style.list}>{renderTableOfContents(data)}</ul>
        </nav>
      )}
      <div className={style.stickyWrapper}>
        <Ariakit.PopoverDisclosure store={popover} className={style.disclosure}>
          <List className="h-6 w-6" />
          <Ariakit.VisuallyHidden>Table of Contents</Ariakit.VisuallyHidden>
        </Ariakit.PopoverDisclosure>
        {!isLarge && (
          <Ariakit.Popover
            store={popover}
            as={Popup}
            portal
            className={style.popover}
            tabIndex={0}
          >
            <Ariakit.PopoverHeading className={style.popoverHeading}>
              Table of Contents
            </Ariakit.PopoverHeading>
            <ul className={style.list}>{renderTableOfContents(data)}</ul>
          </Ariakit.Popover>
        )}
      </div>
    </>
  );
}
