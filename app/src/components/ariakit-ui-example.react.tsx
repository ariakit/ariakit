/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import { ButtonSlot } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { HeadingLevel } from "@ariakit/ui/components/heading.ariakit.react";
import {
  Popover,
  PopoverDescription,
  PopoverDisclosure,
  PopoverHeading,
  PopoverProvider,
} from "@ariakit/ui/components/popover.ariakit.react";
import { clsx } from "clsx";
import { Info } from "lucide-react";
import { useId } from "react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { dedent } from "#app/lib/string.ts";

export interface ExampleGridProps extends ComponentProps<"main"> {}

/**
 * The page of an Ariakit UI sandbox: the grid of example boxes, with no title
 * or navigation around it. Every sandbox renders exactly one.
 */
export function ExampleGrid({
  className,
  children,
  ...props
}: ExampleGridProps) {
  return (
    <main
      className={clsx(
        "grid w-full content-start items-start gap-4 p-4 sm:p-6",
        "grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))]",
        className,
      )}
      {...props}
    >
      {/* Each box is a section of the page, so its title is an h2. */}
      <HeadingLevel level={2}>{children}</HeadingLevel>
    </main>
  );
}

export interface ExampleProps {
  /** Unique within its sandbox. Tests scope their queries with it. */
  title: string;
  /** What the example shows. The More info popover renders it. */
  description?: ReactNode;
  /**
   * The components and variants the example uses, which the More info popover
   * renders. Write it as an indented template literal: the shared indentation
   * and the blank first and last lines are removed.
   */
  code: string;
  /** Spans every column of the grid, for card grids, tables and the like. */
  wide?: boolean;
  /**
   * Stacks the body in a stretched column instead of a wrapping row. Use it for
   * examples that need the full box width, such as a prose column or a table.
   */
  stretch?: boolean;
  children?: ReactNode;
}

/**
 * One example box: a framed article with a title, a More info button and the
 * rendered example. The description and the code open in a popover, so the page
 * shows only the titles and the examples. One box is one example, so sandboxes
 * never group several examples in a single box.
 */
export function Example({
  title,
  description,
  code,
  wide,
  stretch,
  children,
}: ExampleProps) {
  const titleId = useId();
  return (
    <Frame
      render={<article aria-labelledby={titleId} />}
      $rounded="2xl"
      $p={4}
      $border
      className={clsx(
        "grid min-w-0 content-start gap-4",
        wide && "col-span-full",
      )}
    >
      <header className="flex min-h-8 items-center justify-between gap-2">
        {/*
          The box title is deliberately unlike any heading an example can show:
          the Heading sandbox renders h1 to h6, and a reader must still be able
          to tell the chrome from the content. It takes its element from the
          HeadingLevel context but skips the Heading recipe, whose per-element
          size rule would otherwise outrank a size utility.
        */}
        <ak.Heading
          id={titleId}
          className="text-sm font-semibold tracking-[0.06em] text-balance uppercase"
        >
          {title}
        </ak.Heading>
        <ExampleInfo title={title} description={description} code={code} />
      </header>
      {/* Examples that render their own Heading nest under the box title. */}
      <HeadingLevel>
        <div
          className={clsx(
            "flex min-w-0 gap-3",
            stretch ? "flex-col items-stretch" : "flex-wrap items-start",
          )}
        >
          {children}
        </div>
      </HeadingLevel>
    </Frame>
  );
}

interface ExampleInfoProps extends Pick<
  ExampleProps,
  "title" | "description" | "code"
> {}

function ExampleInfo({ title, description, code }: ExampleInfoProps) {
  return (
    <PopoverProvider placement="bottom-end">
      <PopoverDisclosure aria-label="More info" className="-my-1 -me-2">
        <ButtonSlot>
          <Info />
        </ButtonSlot>
      </PopoverDisclosure>
      {/*
        Portaled and unmounted while hidden. A sandbox that holds overlays open
        marks the grid around them as outside them, and Ariakit reads that mark
        from an element's ancestors, so a popover in the grid would ignore
        Escape even though it mounts later. In the portal it has no marked
        ancestor. Unmounted, its text never matches a query or a find while it
        is closed.
        https://github.com/ariakit/ariakit/issues/7463
      */}
      <Popover
        portal
        unmountOnHide
        className="flex max-h-(--popover-available-height) w-[min(36rem,calc(100vw-2rem))] flex-col gap-3"
      >
        <PopoverHeading>{title}</PopoverHeading>
        {description != null && (
          <PopoverDescription className="text-sm text-pretty">
            {description}
          </PopoverDescription>
        )}
        <Frame
          render={<pre />}
          $rounded="xl"
          $p={3}
          $border
          className="ak-ink-70 min-h-0 min-w-0 overflow-auto font-mono text-xs"
        >
          <code>{dedent(code)}</code>
        </Frame>
      </Popover>
    </PopoverProvider>
  );
}

export interface ExampleStageProps extends ComponentProps<"div"> {
  /**
   * Where the anchor sits, so the overlay has the rest of the stage to itself.
   * @default "center"
   */
  anchor?: "start" | "center" | "end";
  /**
   * The stage height, in spacing units. It must fit the overlay and its anchor,
   * because an overlay held open inline does not grow the box on its own.
   * @default 64
   */
  height?: number;
}

/**
 * Reserves room for a non-modal overlay that an example holds open inline, and
 * keeps the overlay inside the box. Every open popover, tooltip, combobox
 * popover and select popover in a sandbox renders in one of these, so the page
 * has a deterministic height for its screenshot. Dialogs are never held open:
 * their boxes render the closed disclosure, and tests open them the way a user
 * would.
 */
export function ExampleStage({
  anchor = "center",
  height = 64,
  className,
  style,
  ...props
}: ExampleStageProps) {
  const size = {
    "--example-stage-height": `calc(var(--spacing) * ${height})`,
  } as CSSProperties;
  return (
    <div
      className={clsx(
        "relative flex min-h-(--example-stage-height) w-full min-w-0 justify-center",
        anchor === "start" && "items-start",
        anchor === "center" && "items-center",
        anchor === "end" && "items-end",
        className,
      )}
      style={{ ...size, ...style }}
      {...props}
    />
  );
}

/**
 * Holds a popover, a combobox popover or a select popover open inside an
 * `ExampleStage`. It renders in place instead of a portal, stays pinned to its
 * placement because the position is computed against the viewport, leaves focus
 * where it was so the page does not jump on load, and ignores the clicks and
 * keys that would otherwise close it.
 */
export const openPopoverProps = {
  portal: false,
  flip: false,
  slide: false,
  autoFocusOnShow: false,
  hideOnInteractOutside: false,
  hideOnEscape: false,
  // Ariakit measures the room below the anchor against the viewport at load, so
  // a popover held open below the fold would get a negative height cap and
  // collapse to its padding. The stage reserves the room instead.
  style: { "--popover-available-height": "100dvh" } as CSSProperties,
};

/**
 * Holds a tooltip open inside an `ExampleStage`. It renders in place and stays
 * pinned to its placement. A tooltip held with `open` still hides on outside
 * focus, clicks, pointer moves and Escape, and the controlled prop reopens it a
 * few milliseconds later; each reopen marks the overlay that has focus as
 * outside it, which makes that overlay ignore Escape. Turning the dismissals
 * off keeps the held tooltip still.
 */
export const openTooltipProps = {
  portal: false,
  flip: false,
  slide: false,
  hideOnInteractOutside: false,
  hideOnHoverOutside: false,
  hideOnEscape: false,
} as const;
