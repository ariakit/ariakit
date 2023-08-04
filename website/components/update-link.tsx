import { forwardRef, useId } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { getPageTitle } from "build-pages/get-page-title.js";
import pageIndex from "build-pages/index.js";
import { ChevronRight } from "icons/chevron-right.jsx";
import { NewWindow } from "icons/new-window.jsx";
import { Npm } from "icons/npm.jsx";
import Link from "next/link.js";
import { twJoin, twMerge } from "tailwind-merge";
import type { UpdateItem } from "updates.js";
import { getPageIcon } from "utils/get-page-icon.jsx";
import { DateFromNow } from "./date-from-now.jsx";

export interface UpdateLinkProps
  extends UpdateItem,
    Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "title" | "type"> {
  dateStyle?: "fromNow" | "long";
  layer?: "popup" | "page";
  date?: Date;
  unread?: boolean;
  connected?: boolean;
}

function renderPaths(id: string, url: URL) {
  const [, category, page] = url.pathname.split("/");
  if (url.origin !== "https://ariakit.org") {
    return (
      <span
        aria-hidden
        id={`${id}/path`}
        className="flex items-center gap-1 text-sm"
      >
        <span className="truncate text-blue-700 dark:text-blue-400 ">
          {url.host}
        </span>
        <NewWindow className="h-3 w-3 opacity-50" />
      </span>
    );
  }
  if (!category) return;
  const pageTitle = pageIndex[category]?.find((p) => p.slug === page)?.title;
  return (
    <span aria-hidden id={`${id}/path`} className="flex items-center text-sm">
      <span className="sr-only">In </span>
      <span className="truncate text-blue-700 dark:text-blue-400 ">
        {getPageTitle(category)}
      </span>
      {pageTitle && (
        <>
          <ChevronRight aria-label="/" className="h-3 w-3 opacity-50" />
          <span className="truncate text-blue-700 dark:text-blue-400 ">
            {pageTitle}
          </span>
        </>
      )}
      <span className="sr-only">.</span>
    </span>
  );
}

export const UpdateLink = forwardRef<HTMLAnchorElement, UpdateLinkProps>(
  function UpdateLink(
    {
      dateStyle = "long",
      layer = "page",
      title,
      type,
      dateTime,
      date = new Date(dateTime),
      unread,
      connected,
      ...props
    },
    ref,
  ) {
    let id = useId();
    id = props.id ?? id;
    const url = new URL(props.href, "https://ariakit.org");
    const [, category, page] = url.pathname.split("/");
    return (
      <Link
        ref={ref}
        aria-labelledby={`${id}/label`}
        aria-describedby={`${id}/path ${id}/description`}
        target={url.origin !== "https://ariakit.org" ? "_blank" : undefined}
        {...props}
        className={twMerge(
          "group relative flex w-full scroll-m-2 scroll-mb-14 scroll-mt-[92px] items-start gap-4 rounded p-4",
          "focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_theme(colors.blue.600)]",
          "active:!bg-blue-200/70 dark:active:!bg-blue-800/25 [@media(any-hover:hover)]:hover:bg-blue-200/40 [@media(any-hover:hover)]:dark:hover:bg-blue-600/25",
          props.className,
        )}
      >
        {unread && (
          <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
        )}
        {connected && (
          <div className="absolute -top-3 left-[47px] h-6 w-0.5 bg-black/10 dark:bg-white/10" />
        )}
        <div
          aria-hidden
          className={twJoin(
            "flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-sm",
            "bg-gray-150 group-hover:bg-black/[7.5%] group-active:bg-black/[7.5%]",
            "dark:group-hover:bg-black/70 dark:group-active:bg-black/70",
            layer === "page" ? "dark:bg-gray-850" : "dark:bg-gray-800",
          )}
        >
          {type === "page" && category ? (
            getPageIcon(category, page)
          ) : type === "release" ? (
            <Npm />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col">
          <span
            id={`${id}/label`}
            className="truncate font-medium tracking-wide"
          >
            {title}
          </span>
          {renderPaths(id, url)}
          <time
            aria-hidden
            id={`${id}/description`}
            dateTime={date.toISOString()}
            className="truncate text-sm text-black/70 dark:text-white/70"
          >
            {dateStyle === "long" ? (
              date.toLocaleString("en-US", { dateStyle: "long" })
            ) : (
              <DateFromNow dateTime={dateTime} />
            )}
          </time>
        </div>
      </Link>
    );
  },
);
