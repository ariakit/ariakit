"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "packages/ariakit-core/src/utils/misc.js";
import type { TableOfContents as Data } from "website/build-pages/types.js";
import Link from "website/components/link.js";
import Hashtag from "website/icons/hashtag.js";
import tw from "website/utils/tw.js";

interface Props {
  data: Data;
}

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

export default function TableOfContents({ data }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);

  const renderTableOfContents = (data: Data) =>
    data.map((item) => {
      const Component = item.id ? "a" : Link;
      const active =
        (activeId && item.id === activeId) ||
        (item.children && !item.id && !activeId);
      return (
        <li key={item.href} className="flex flex-col">
          <Component
            href={item.href}
            className={tw`group flex items-center gap-1
            underline-offset-[0.2em] hover:text-black dark:hover:text-white`}
          >
            {item.id ? (
              <Hashtag className="h-[1em] w-[1em] flex-none opacity-60" />
            ) : (
              <span
                aria-hidden
                className="w-2 flex-none text-base font-bold opacity-40"
              >
                /
              </span>
            )}
            <span
              className={cx(
                "truncate group-hover:underline",
                active &&
                  "font-semibold text-black dark:font-medium dark:text-blue-400"
              )}
            >
              {item.text}
            </span>
          </Component>
          {item.children && (
            <ul
              className={tw`ml-1.5 flex flex-col border-l-0 border-black/10
              pl-1.5 dark:border-white/10`}
            >
              {renderTableOfContents(item.children)}
            </ul>
          )}
        </li>
      );
    });

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

  return (
    <nav
      ref={ref}
      className={tw`m-4 flex max-h-[calc(100vh-theme(spacing.36))]
      w-[224px] flex-col gap-4 overflow-auto rounded-md border-0
    border-black/10 p-3 pl-1 dark:border-white/10 md:sticky
      md:top-32`}
    >
      <ul
        className={tw`flex flex-col text-sm leading-8 text-black/80
        dark:text-white/70`}
      >
        {renderTableOfContents(data)}
      </ul>
    </nav>
  );
}
