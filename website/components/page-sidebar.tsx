import type { ReactNode } from "react";
import type { TableOfContents as TableOfContentsData } from "build-pages/types.ts";
import { ChevronRight } from "icons/chevron-right.tsx";
import { FolderOpen } from "icons/folder-open.tsx";
import Link from "next/link.js";
import { twJoin } from "tailwind-merge";
import { TableOfContents } from "./table-of-contents.tsx";

interface PageSidebarProps {
  tableOfContents: TableOfContentsData;
  children?: ReactNode;
}

export function PageSidebar({ tableOfContents, children }: PageSidebarProps) {
  const getTableOfContentsIds = (data: TableOfContentsData): string[] => {
    return [...data].reverse().flatMap((item) => {
      if (item.children) {
        return [...getTableOfContentsIds(item.children), item.id];
      }
      if (item.id) {
        return item.id;
      }
      return [];
    });
  };

  const renderTableOfContents = (data: TableOfContentsData, depth = 0) =>
    data.map((item) => {
      const isFolder = !item.id && item.href.split("/").length === 2;
      const Component = item.id || !isFolder ? "a" : Link;
      const isPage = !isFolder && !item.id;
      const Icon = isFolder ? FolderOpen : null;
      const icon = Icon ? (
        <Icon className="h-5 w-5 flex-none translate-y-px opacity-60 group-aria-[current]:opacity-100 md:h-4 md:w-4" />
      ) : null;
      return (
        <li key={item.href} className="flex flex-col">
          <Component
            href={item.href}
            data-depth={depth}
            aria-current={isPage ? "true" : undefined}
            className={twJoin(
              "group relative flex items-start gap-2 rounded py-1.5 pr-4 md:gap-1",
              "aria-[current]:bg-black/[7.5%] dark:aria-[current]:bg-white/[7.5%]",
              "underline-offset-[0.2em] hover:text-black dark:hover:text-white",
              "scroll-my-2 focus-visible:ariakit-outline-input",
              `data-[depth="0"]:scroll-mt-96`,
              `data-[depth="0"]:pl-2 data-[depth="1"]:pl-2 data-[depth="2"]:pl-9 data-[depth="3"]:pl-24`,
              `md:data-[depth="0"]:pl-2 md:data-[depth="1"]:pl-2 md:data-[depth="2"]:pl-6 md:data-[depth="3"]:pl-12`,
              isPage && "font-semibold text-black dark:text-white",
            )}
          >
            <span className="absolute -left-4 top-0 hidden h-full w-2 rounded-r bg-blue-600 group-aria-[current]:block" />
            {icon}
            <span className="flex gap-[2px] group-aria-[current]:text-black dark:group-aria-[current]:text-white [@media(any-hover:hover)]:group-hover:underline">
              {depth > 0 && (
                <ChevronRight className="h-3.5 w-3.5 flex-none -translate-x-[2px] translate-y-[4.5px] opacity-60 md:translate-y-[3px]" />
              )}
              {item.text}
            </span>
          </Component>
          {item.children && (
            <ul className="flex flex-col">
              {renderTableOfContents(item.children, depth + 1)}
            </ul>
          )}
        </li>
      );
    });

  const navList = (
    <ul className="flex flex-col p-2 text-black/90 dark:text-white/80 md:p-0 md:text-sm">
      {renderTableOfContents(tableOfContents)}
    </ul>
  );

  return (
    <TableOfContents
      ids={getTableOfContentsIds(tableOfContents)}
      popoverContents={
        <div className="flex flex-col gap-4">
          {navList}
          {children}
        </div>
      }
    >
      <div className="sticky top-32 m-4 mt-16 hidden max-h-[calc(100vh-theme(spacing.36))] w-60 flex-none flex-col gap-8 border-l border-black/10 dark:border-white/10 md:flex">
        <nav className="w-full flex-1 flex-col gap-4 overflow-auto p-3 pr-1">
          {navList}
        </nav>
        {children}
      </div>
    </TableOfContents>
  );
}
