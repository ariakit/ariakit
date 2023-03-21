"use client";
import { useEffect, useState } from "react";
import { cx } from "@ariakit/core/utils/misc";
import Link from "./link.js";

type TableOfContents = Array<{
  id: string;
  text: string;
  children?: TableOfContents;
}>;

interface TableOfContentsProps {
  tableOfContents: TableOfContents;
}

export default function TableOfContents({
  tableOfContents,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const ids = tableOfContents
        .map((item) => [
          item.id,
          ...(item.children?.map((child) => child.id) || []),
        ])
        .flat()
        .reverse();
      const activeId = ids.find((id) => {
        const element = document.getElementById(id);
        if (!element) return false;
        const { top } = element.getBoundingClientRect();
        const { scrollMarginTop } = getComputedStyle(element);
        return top - parseInt(scrollMarginTop) <= 0;
      });
      setActiveId(activeId ?? "");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [tableOfContents]);

  return (
    <nav className="flex w-[256px] flex-col gap-4 p-4 md:sticky md:top-24 md:mt-[100px]">
      <div className="text-xs font-bold uppercase text-black/60 dark:text-white/50">
        On this page
      </div>
      <ul className="flex flex-col gap-2 text-sm [&>li]:opacity-80">
        <li className={cx(!activeId && "font-bold !opacity-100")}>
          <Link href="#">Introduction</Link>
        </li>
        {tableOfContents.map((item) => (
          <li
            key={item.id}
            className={cx(activeId === item.id && "font-bold !opacity-100")}
          >
            <Link href={`#${item.id}`}>{item.text}</Link>
            {item.children && (
              <ul className="mt-2 flex flex-col gap-2 pl-4">
                {item.children.map((item) => (
                  <li
                    key={item.id}
                    className={cx(
                      activeId === item.id
                        ? "font-bold !opacity-100"
                        : "!font-normal !opacity-80"
                    )}
                  >
                    <Link href={`#${item.id}`}>{item.text}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
