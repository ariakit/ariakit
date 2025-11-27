/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import clsx from "clsx";
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
    inert: collapsed ? "" : undefined,
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
        className="absolute group/expand grid outline-none ak-frame-cover/1 py-2 inset-0 ak-layer-current bg-transparent bg-linear-to-b from-transparent from-[calc(100%-var(--line-height)*8)] ak-light:from-[calc(100%-var(--line-height)*4)] to-[calc(100%-var(--line-height))] to-(--ak-layer) z-2 justify-center items-end"
      >
        <div className="ak-button h-9 ak-layer-pop text-sm/[1.5rem] hover:ak-layer-hover group-focus-visible/expand:ak-button_focus group-active/expand:ak-button_active">
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
        <div className="grid justify-center ak-frame-force-field/0">
          <button
            onClick={collapse}
            className="ak-button ak-layer ak-bordering h-9 text-sm/[1.5rem]"
          >
            Collapse code
            <Icon className="text-base" name="chevronUp" />
          </button>
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
