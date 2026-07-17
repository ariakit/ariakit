/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/ariakit/button.react.tsx";
import { button } from "@ariakit/ui/styles/button.ts";
import { clsx } from "clsx";
import * as React from "react";
import { Icon } from "#app/icons/icon.react.tsx";

interface UseCollapsibleProps {
  collapsible: boolean;
}

export function useCollapsible<T extends HTMLElement>({
  collapsible,
}: UseCollapsibleProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const expandButtonRef = React.useRef<HTMLButtonElement>(null);
  const scrollableRef = React.useRef<T>(null);
  const [_collapsed, setCollapsed] = React.useState(true);
  const collapsed = collapsible && _collapsed;

  const collapse = () => {
    setCollapsed(true);
    requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      const expandButton = expandButtonRef.current;
      expandButton?.focus({ preventScroll: true });
      wrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const expand = () => {
    setCollapsed(false);
    requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      const scrollable = scrollableRef.current;
      scrollable?.focus({ preventScroll: true });
      wrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const scrollableProps = {
    ref: scrollableRef,
    inert: collapsed || undefined,
    tabIndex: -1,
    "aria-hidden": collapsed,
    onKeyDown: (event: React.KeyboardEvent<T>) => {
      if (event.key === "Escape") {
        collapse();
      }
    },
  };

  const expandButton =
    collapsible && collapsed ? (
      <button
        data-expand
        ref={expandButtonRef}
        onClick={expand}
        className="absolute group/expand grid outline-none ak-frame ak-frame-cover ak-frame-p-1 py-2 inset-0 ak-layer bg-transparent bg-linear-to-b from-transparent from-[calc(100%-var(--line-height)*8)] ak-light:from-[calc(100%-var(--line-height)*4)] to-[calc(100%-var(--line-height))] to-(--ak-layer) z-2 justify-center items-end"
      >
        {/* The overlay button is the interactive element: its focus and
            active states are forced onto this button-look box through the
            group variants (the resolved plugin classes of the legacy
            forced-state utilities), and the box's own scale is disabled so
            the two never combine. */}
        <div
          {...button.jsx({
            $active: false,
            class: clsx(
              "h-9 items-center text-sm/[1.5rem]",
              "group-focus-visible/expand:outline-2",
              "group-active/expand:origin-bottom group-active/expand:scale-x-[98%] group-active/expand:scale-y-[96%]",
            ),
          })}
        >
          Expand code
          <Icon className="text-base" name="chevronDown" />
        </div>
      </button>
    ) : null;

  const collapseButton = (
    <div
      className={clsx(
        "sticky bottom-2 z-10",
        collapsible && !collapsed && "my-2",
      )}
    >
      {collapsible && !collapsed && (
        <div className="grid justify-center ak-frame ak-frame-force ak-frame-field/0">
          <Button
            onClick={collapse}
            // The button floats over the code surface, so it always lightens
            // ($lighten 1.2 = the legacy ak-layer-lighten-6) instead of using
            // the default scheme-aware lightness offset.
            $lightnessOffset={false}
            $lighten={1.2}
            className="ak-frame-bordering h-9 items-center text-sm/[1.5rem]"
          >
            Collapse code
            <Icon className="text-base" name="chevronUp" />
          </Button>
        </div>
      )}
    </div>
  );

  return {
    wrapperRef,
    collapsed,
    expandButton,
    scrollableProps,
    collapseButton,
  };
}
