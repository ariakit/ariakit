"use client";

import { useEffect, useRef, useState } from "react";
// import * as Ariakit from "@ariakit/react";
import { cx } from "packages/ariakit-core/src/utils/misc.js";
import type { TableOfContents as Data } from "website/build-pages/types.js";
// import HeaderPopover from "website/components/header-popover.js";
import { Link } from "website/components/link.js";
// import List from "website/icons/list.js";
import { tw } from "website/utils/tw.js";

interface Props {
  data: Data;
}

const padding: Record<number, string> = {
  0: "pl-0",
  1: "pl-3",
  2: "pl-6",
  3: "pl-9",
};

const style = {
  nav: tw`
    m-4 flex max-h-[calc(100vh-theme(spacing.36))]
    w-[224px] flex-col gap-4 overflow-auto border-l
  border-black/10 p-3 dark:border-white/10 md:sticky
    md:top-32
  `,
  list: tw`
    flex flex-col text-sm leading-8 text-black/80
    dark:text-white/70
  `,
  subList: tw`
    flex flex-col
  `,
  listItem: tw`
    flex flex-col
  `,
  link: tw`
    group flex items-center gap-1 rounded-sm
    underline-offset-[0.2em] hover:text-black focus-visible:ariakit-outline-input
    dark:hover:text-white
  `,
  slash: tw`
    w-2 flex-none text-base font-semibold opacity-40
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
  // const popover = Ariakit.usePopoverStore();
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
    data.map((item) => {
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
            <span
              className={cx(
                "truncate group-hover:underline",
                active &&
                  "font-semibold tracking-[-0.006em] text-black dark:font-medium dark:tracking-[-0.004em] dark:text-blue-400"
              )}
            >
              {item.text}
            </span>
          </Component>
          {item.children && (
            <ul className={style.subList}>
              {renderTableOfContents(item.children, depth + 1)}
            </ul>
          )}
        </li>
      );
    });

  const nav = (
    <nav ref={ref} className={style.nav}>
      <ul className={style.list}>{renderTableOfContents(data)}</ul>
    </nav>
  );

  return nav;
  // return (
  //   <>
  //     <Ariakit.PopoverDisclosure
  //       store={popover}
  //       className="sticky top-[72px] right-4 z-40 flex h-12 w-12 items-center justify-center self-end rounded-full bg-black/10 dark:bg-white/10"
  //     >
  //       <List className="h-6 w-6" />
  //     </Ariakit.PopoverDisclosure>
  //     <Ariakit.Popover store={popover} modal as={HeaderPopover}>
  //       {nav}
  //     </Ariakit.Popover>
  //   </>
  // );
}
