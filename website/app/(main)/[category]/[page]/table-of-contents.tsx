"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as Ariakit from "@ariakit/react";
import { Popup } from "components/popup.js";
import { List } from "icons/list.js";
import { tw } from "utils/tw.js";
import { useMedia } from "utils/use-media.js";

interface Props {
  ids: string[];
  children?: ReactNode;
  popoverContents?: ReactNode;
}

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
};

export function TableOfContents({ ids, children, popoverContents }: Props) {
  const isLarge = useMedia("(min-width: 768px)", true);
  const popover = Ariakit.usePopoverStore();
  const mounted = popover.useState("mounted");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const activeId = ids.find((id) => {
        const element = document.getElementById(id);
        if (!element) return false;
        const { top } = element.getBoundingClientRect();
        const { scrollMarginTop } = getComputedStyle(element);
        return top - parseInt(scrollMarginTop) <= 64;
      });
      setActiveId(activeId ?? null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);

  useEffect(() => {
    const anchors = document.body.querySelectorAll("li a[href^='#']");
    anchors.forEach((anchor) => {
      anchor.removeAttribute("aria-current");
      if (anchor.getAttribute("href") === `#${activeId ? activeId : ""}`) {
        anchor.setAttribute("aria-current", "true");
      }
    });
  }, [activeId, mounted, isLarge, children, popoverContents]);

  return (
    <>
      {isLarge && children}
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
            fixed
            tabIndex={0}
            gutter={8}
            overflowPadding={12}
            className={style.popover}
          >
            <Ariakit.PopoverHeading className={style.popoverHeading}>
              Table of Contents
            </Ariakit.PopoverHeading>
            {popoverContents}
          </Ariakit.Popover>
        )}
      </div>
    </>
  );
}
