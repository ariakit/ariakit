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
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { HeadingLevel } from "@ariakit/ui/components/heading.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { clsx } from "clsx";
import { useId } from "react";
import type {
  CSSProperties,
  ComponentProps,
  ReactElement,
  ReactNode,
} from "react";
import {
  markExampleCodeTransparent,
  serializeExample,
} from "./example-code.react.ts";
import { SCREENSHOT_FOCUS_ATTRIBUTE } from "./pages.ts";

/**
 * Spread this on the one element per page that the screenshot suite moves real
 * keyboard focus to, so every baseline shows exactly one focus ring. Never set
 * Ariakit's internal `data-focus-visible` marker or any other internal marker
 * instead.
 *
 * The explicit tab index is what makes the mechanism work in every engine:
 * WebKit leaves `<button>` and `<a href>` out of sequential focus navigation
 * unless full keyboard access is on, and the suite reaches the target with a
 * real `Tab` press.
 */
export const screenshotFocus = {
  [SCREENSHOT_FOCUS_ATTRIBUTE]: "",
  tabIndex: 0,
} as const;

export interface ExampleGridProps extends ComponentProps<"div"> {}

/**
 * The grid of example boxes that fills a page. Every page renders exactly one.
 */
export function ExampleGrid({ className, ...props }: ExampleGridProps) {
  return (
    <div
      className={clsx(
        "grid items-start gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))]",
        className,
      )}
      {...props}
    />
  );
}

export interface ExampleProps {
  /** Unique within its page. Tests scope their queries with it. */
  title: string;
  description?: ReactNode;
  /**
   * Replaces the snippet generated from `children`. Use it when a page renders
   * a stateful helper the serializer cannot name, and write the element tree a
   * reader should see. It is serialized by the same rules, so it stays
   * type-checked.
   */
  code?: ReactElement;
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
 * One example box: a framed article with a title, an optional description, the
 * rendered example and the snippet of components and variants it uses. One box
 * is one example, so pages never group several examples in a single box.
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
      <header className="grid gap-1.5">
        {/*
          The box title is deliberately unlike any heading an example can show:
          the Heading page renders h1 to h6, and a reader must still be able to
          tell the chrome from the content. It takes its element from the
          HeadingLevel context but skips the Heading recipe, whose per-element
          size rule would otherwise outrank a size utility.
        */}
        <ak.Heading
          id={titleId}
          className="text-sm font-semibold tracking-[0.06em] text-balance uppercase"
        >
          {title}
        </ak.Heading>
        {description != null && (
          <Text className="ak-ink-70 text-sm text-pretty">{description}</Text>
        )}
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
      <Frame
        render={<pre />}
        $rounded="xl"
        $p={3}
        $border
        className="ak-ink-70 min-w-0 overflow-x-auto font-mono text-xs"
      >
        <code>{serializeExample(code ?? children)}</code>
      </Frame>
    </Frame>
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
 * popover and select popover on a page renders in one of these, so the page has
 * a deterministic height for its screenshot. Dialogs are never held open: their
 * boxes render the closed disclosure, and tests open them the way a user would.
 *
 * The stage is layout, so it prints nothing in the snippet: only the overlay
 * inside it does.
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

markExampleCodeTransparent(ExampleStage);

/**
 * Holds a popover, a combobox popover or a select popover open inside an
 * `ExampleStage`. It renders in place instead of a portal, stays pinned to its
 * placement because the position is computed against the viewport, leaves focus
 * where it was so the page does not jump on load, and ignores the clicks and
 * keys that would otherwise close it.
 *
 * None of these props reach the snippet: the serializer prints only `$`
 * variants, state props and element props.
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
