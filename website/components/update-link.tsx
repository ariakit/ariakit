import Link from "next/link.js";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef, useId } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import { getPageTitle } from "@/build-pages/get-page-title.js";
import pageIndex from "@/build-pages/index.ts";
import { ChevronRight } from "@/icons/chevron-right.tsx";
import { NewWindow } from "@/icons/new-window.tsx";
import { Npm } from "@/icons/npm.tsx";
import { Substack } from "@/icons/substack.tsx";
import { getPageIcon } from "@/lib/get-page-icon.tsx";
import type { UpdateItem } from "@/updates.ts";
import { DateFromNow } from "./date-from-now.tsx";
import { PlusBordered } from "./plus-bordered.tsx";

export interface UpdateLinkProps
  extends UpdateItem,
    Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "title" | "type"> {
  dateStyle?: "fromNow" | "long";
  layer?: "popup" | "page";
  date?: Date;
  unread?: boolean;
  connected?: boolean;
  plus?: boolean;
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
        <NewWindow className="size-3 opacity-50" />
      </span>
    );
  }
  if (!category) return;
  const pageTitle = pageIndex[category]?.find((p) => p.slug === page)?.title;
  return (
    <span aria-hidden id={`${id}/path`} className="flex items-center text-sm">
      <span className="sr-only">In </span>
      <span className="truncate text-blue-700 dark:text-blue-400 ">
        {getPageTitle(category, true)}
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
      plus = false,
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
          "group relative z-[1] flex w-full scroll-m-2 scroll-mb-14 scroll-mt-[92px] items-start gap-4 rounded p-4",
          "focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_theme(colors.blue.600)]",
          "active:!bg-blue-200/70 dark:active:!bg-blue-800/25 [@media(any-hover:hover)]:hover:bg-blue-200/40 [@media(any-hover:hover)]:dark:hover:bg-blue-600/25",
          props.className,
        )}
      >
        {unread && (
          <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600 dark:bg-blue-500" />
        )}
        {connected && (
          <div className="absolute -top-3 left-[47px] h-6 w-0.5 bg-black/10 dark:bg-white/10" />
        )}
        <PlusBordered
          plus={plus}
          thickerOnLight
          aria-hidden
          className={twJoin(
            "flex h-16 w-16 flex-none items-center justify-center rounded-sm",
            "bg-gray-150",
            !plus && "group-hover:bg-black/[7.5%] group-active:bg-black/[7.5%]",
            !plus &&
              "dark:group-hover:bg-black/45 dark:group-active:bg-black/45",
            layer === "page" ? "dark:bg-gray-850" : "dark:bg-gray-800",
          )}
        >
          {type === "page" && category ? (
            getPageIcon(category, page)
          ) : type === "release" ? (
            <Npm />
          ) : type === "newsletter" ? (
            <Substack />
          ) : null}
        </PlusBordered>
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
