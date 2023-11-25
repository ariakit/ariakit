"use client";

import { useId, useMemo, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { isDownloading, isOpeningInNewTab } from "@ariakit/core/utils/events";
import * as Ariakit from "@ariakit/react";
import { useSafeLayoutEffect } from "@ariakit/react-core/utils/hooks";
import { track } from "@vercel/analytics";
import { Bell } from "icons/bell.jsx";
import { partition } from "lodash-es";
import Link from "next/link.js";
import { twJoin, twMerge } from "tailwind-merge";
import type { UpdateItem } from "updates.js";
import { useMedia } from "utils/use-media.js";
import { useUpdates } from "utils/use-updates.js";
// import { NewsletterForm } from "./newsletter-form.jsx";
import { Command } from "./command.jsx";
import { Popup } from "./popup.jsx";
import { TooltipButton } from "./tooltip-button.jsx";
import { UpdateLink } from "./update-link.jsx";

export interface HeaderUpdatesProps extends ComponentPropsWithoutRef<"button"> {
  updates: UpdateItem[];
  newPages: string[];
}

export function HeaderUpdates({
  updates,
  newPages,
  ...props
}: HeaderUpdatesProps) {
  const id = useId();
  const isLarge = useMedia("(min-width: 640px)", true);
  const { seen, previousSeen, seeNow } = useUpdates({ updates });
  const popover = Ariakit.usePopoverStore({
    animated: true,
    placement: isLarge ? "bottom-end" : "bottom",
    setOpen(open) {
      if (open) {
        seeNow();
        track("header-updates", { unreadLength });
      }
    },
  });

  const items = useMemo(
    () => updates.map((item) => ({ ...item, date: new Date(item.dateTime) })),
    [updates],
  );
  const [unreadItems, recentItems] = useMemo(() => {
    return partition(items, (item) => item.date > previousSeen);
  }, [items, previousSeen]);

  const [unreadLength, setUnreadLength] = useState(0);

  useSafeLayoutEffect(() => {
    setUnreadLength(items.filter((item) => item.date > seen).length);
  }, [items, seen]);

  return (
    <>
      <TooltipButton
        {...props}
        title="Updates"
        className={twJoin("h-10 w-10 flex-none p-0", props.className)}
        render={
          <Ariakit.PopoverDisclosure
            store={popover}
            render={<Command variant="secondary" flat />}
          />
        }
      >
        <span className="sr-only">
          View {unreadLength ? `${unreadLength} ` : ""}new updates
        </span>
        <Bell />
        {!!unreadLength && (
          <span
            data-bignum={unreadLength > 9 || undefined}
            className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[11px] tabular-nums text-white animate-in zoom-in data-[bignum]:right-[2px] data-[bignum]:top-[2px] data-[bignum]:h-3 data-[bignum]:w-3 data-[bignum]:dark:bg-blue-500"
          >
            {unreadLength > 9 ? null : unreadLength}
          </span>
        )}
      </TooltipButton>
      <Ariakit.Popover
        store={popover}
        unmountOnHide
        shift={-8}
        className="max-w-[min(var(--popover-available-width),480px)] origin-top-right animate-in fade-in zoom-in-95 data-[leave]:animate-out data-[leave]:fade-out data-[leave]:zoom-out-95"
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
          <Ariakit.PopoverDismiss className="relative flex h-10 w-10 flex-none cursor-default items-center justify-center rounded-md border-none hover:bg-black/5 data-[focus-visible]:!ariakit-outline-input dark:hover:bg-white/5 [&:focus-visible]:outline-none [&_svg]:stroke-[1pt]" />
        </div>
        <div className="flex flex-col gap-2 bg-inherit">
          {/* <Ariakit.HeadingLevel>
            <div className="grid gap-3 rounded bg-gradient-to-br from-blue-50 to-pink-50 p-4 dark:from-blue-600/30 dark:to-pink-600/10">
              <div className="flex flex-col gap-2">
                <Ariakit.Heading className="font-medium">
                  Newsletter
                </Ariakit.Heading>
                <p className="text-[15px] dark:font-light">
                  Join 1,000+ subscribers and receive monthly{" "}
                  <strong className="font-semibold">tips &amp; updates</strong>{" "}
                  on new Ariakit content.
                </p>
              </div>
              <NewsletterForm
                location="header-updates"
                className="flex flex-col gap-2"
              >
                <div className="flex gap-2">
                  <Ariakit.Focusable
                    className="h-10 w-full scroll-mt-96 rounded border-none bg-white px-4 text-black placeholder-black/60 shadow-input focus-visible:ariakit-outline-input"
                    render={
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Your email address"
                      />
                    }
                  />
                  <button className="h-10 !cursor-pointer scroll-mt-96 whitespace-nowrap rounded bg-blue-600 px-4 text-white shadow-xl hover:bg-blue-800 focus-visible:ariakit-outline">
                    Subscribe
                  </button>
                </div>
              </NewsletterForm>
            </div>
          </Ariakit.HeadingLevel> */}
          {!!unreadItems.length && (
            <div className="flex flex-col bg-inherit">
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
                        connected={index !== 0}
                        plus={newPages.some((page) =>
                          item.href.startsWith(page),
                        )}
                        {...item}
                      />
                    </li>
                  ))}
                </ul>
              </Ariakit.HeadingLevel>
            </div>
          )}
          {!!recentItems.length && (
            <div className="flex flex-col bg-inherit">
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
                      <UpdateLink
                        dateStyle="fromNow"
                        layer="popup"
                        connected={index !== 0}
                        plus={newPages.some((page) =>
                          item.href.startsWith(page),
                        )}
                        {...item}
                      />
                    </li>
                  ))}
                </ul>
              </Ariakit.HeadingLevel>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 z-40 bg-inherit py-2">
          <Link
            href="/updates"
            className="block h-10 w-full rounded bg-gray-150 p-2 text-center hover:bg-blue-200/40 active:bg-blue-200/70 focus-visible:ariakit-outline-input dark:bg-gray-650 dark:hover:bg-blue-600/25 dark:active:bg-blue-800/25"
          >
            View all updates
          </Link>
        </div>
      </Ariakit.Popover>
    </>
  );
}
