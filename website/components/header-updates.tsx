"use client";
import { useEffect, useId, useMemo, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { isDownloading, isOpeningInNewTab } from "@ariakit/core/utils/events";
import * as Ariakit from "@ariakit/react";
import { Bell } from "icons/bell.jsx";
import { partition } from "lodash-es";
import Link from "next/link.js";
import { twJoin, twMerge } from "tailwind-merge";
import type { UpdateItem } from "updates.js";
import { useMedia } from "utils/use-media.js";
import { NewsletterForm } from "./newsletter-form.jsx";
import { Popup } from "./popup.jsx";
import { TooltipButton } from "./tooltip-button.jsx";
import { UpdateLink } from "./update-link.jsx";
import { useUpdatesContext } from "./updates-context.jsx";

export interface HeaderUpdatesProps extends ComponentPropsWithoutRef<"button"> {
  updates: UpdateItem[];
}

export function HeaderUpdates({ updates, ...props }: HeaderUpdatesProps) {
  const id = useId();
  const isLarge = useMedia("(min-width: 640px)", true);
  const { seen, previousSeen, seeNow } = useUpdatesContext();
  const popover = Ariakit.usePopoverStore({
    placement: isLarge ? "bottom-end" : "bottom",
    setOpen(open) {
      if (open) {
        seeNow();
      }
    },
  });

  const mounted = popover.useState("mounted");
  const items = useMemo(
    () => updates.map((item) => ({ ...item, date: new Date(item.dateTime) })),
    [updates]
  );
  const [unreadItems, recentItems] = useMemo(() => {
    return partition(items, (item) => item.date > previousSeen);
  }, [items, previousSeen]);

  const [unreadLength, setUnreadLength] = useState(0);

  useEffect(() => {
    setUnreadLength(items.filter((item) => item.date > seen).length);
  }, [items, seen]);

  return (
    <>
      <TooltipButton
        {...props}
        title="Updates"
        className={twJoin(
          "relative flex h-10 w-10 flex-none cursor-default items-center justify-center rounded-lg border-none hover:bg-black/5 aria-expanded:bg-black/10 dark:hover:bg-white/5 dark:aria-expanded:bg-white/10 [&:focus-visible]:ariakit-outline-input",
          props.className
        )}
        render={<Ariakit.PopoverDisclosure store={popover} />}
      >
        <span className="sr-only">
          View {unreadLength ? `${unreadLength} ` : ""}new updates
        </span>
        <Bell />
        {!!unreadLength && (
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[11px] tabular-nums text-white">
            {unreadLength}
          </span>
        )}
      </TooltipButton>
      {mounted && (
        <Ariakit.Popover
          store={popover}
          backdrop={!isLarge}
          shift={-8}
          className="max-w-[min(var(--popover-available-width),420px)]"
          onClick={(event) => {
            if (!(event.target instanceof Element)) return;
            const closestAnchor = event.target.closest("a");
            if (!closestAnchor) return;
            const anchorEvent = { ...event, currentTarget: closestAnchor };
            if (isOpeningInNewTab(anchorEvent)) return;
            if (isDownloading(anchorEvent)) return;
            popover.hide();
          }}
          render={
            <Popup
              scroller={(props) => (
                <>
                  <Ariakit.PopoverArrow />
                  <div
                    {...props}
                    className={twMerge(props.className, "flex flex-col py-0")}
                  />
                </>
              )}
            />
          }
        >
          <div className="sticky top-0 z-40 flex items-center justify-between bg-inherit py-2 pl-4">
            <Ariakit.PopoverHeading className="font-medium">
              Updates
            </Ariakit.PopoverHeading>
            <Ariakit.PopoverDismiss className="relative flex h-10 w-10 flex-none cursor-default items-center justify-center rounded-md border-none hover:bg-black/5 dark:hover:bg-white/5 [&:focus-visible]:ariakit-outline-input [&_svg]:stroke-[1pt]" />
          </div>
          <NewsletterForm />
          {!!unreadItems.length && (
            <div className="flex flex-col bg-inherit pt-4">
              <Ariakit.HeadingLevel>
                <Ariakit.Heading
                  id={`${id}/unread`}
                  className="sticky top-14 z-10 bg-inherit px-4 py-2 text-sm font-medium text-black/60 dark:text-white/50"
                >
                  Unread
                </Ariakit.Heading>
                <ul aria-labelledby={`${id}/unread`} className="flex flex-col">
                  {unreadItems.map((item, index) => (
                    <li key={index}>
                      <UpdateLink
                        dateStyle="fromNow"
                        layer="popup"
                        unread
                        {...item}
                      />
                    </li>
                  ))}
                </ul>
              </Ariakit.HeadingLevel>
            </div>
          )}
          {!!recentItems.length && (
            <div className="flex flex-col bg-inherit pt-4">
              <Ariakit.HeadingLevel>
                <Ariakit.Heading
                  id={`${id}/recent`}
                  className="sticky top-14 z-10 bg-inherit px-4 py-2 text-sm font-medium text-black/60 dark:text-white/50"
                >
                  Recent
                </Ariakit.Heading>
                <ul aria-labelledby={`${id}/recent`} className="flex flex-col">
                  {recentItems.map((item, index) => (
                    <li key={index}>
                      <UpdateLink dateStyle="fromNow" layer="popup" {...item} />
                    </li>
                  ))}
                </ul>
              </Ariakit.HeadingLevel>
            </div>
          )}
          <div className="sticky bottom-0 z-40 bg-inherit py-2">
            <Link
              href="/updates"
              className="block h-10 w-full rounded bg-gray-150 p-2 text-center hover:bg-blue-200/40 active:bg-blue-200/70 focus-visible:ariakit-outline-input dark:bg-gray-650 dark:hover:bg-blue-600/25 dark:active:bg-blue-800/25"
            >
              View all updates
            </Link>
          </div>
        </Ariakit.Popover>
      )}
    </>
  );
}
