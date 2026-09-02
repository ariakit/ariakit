/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Code } from "@ariakit/ui/components/code.ariakit.react.tsx";
import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react.tsx";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react.tsx";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react.tsx";
import type { LayerProps } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import type { TextProps } from "@ariakit/ui/components/text.ariakit.react.tsx";
import { Text } from "@ariakit/ui/components/text.ariakit.react.tsx";
import { clsx } from "clsx";
import type * as React from "react";

export const LOREM =
  "Ariakit components are unstyled by default. The styling layer composes reusable recipes with local utility overrides, so every surface below reads its color from the one behind it.";

const samplesColumns = {
  auto: "grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))]",
  narrow: "grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))]",
  wide: "grid-cols-[repeat(auto-fit,minmax(min(100%,30rem),1fr))]",
  full: "grid-cols-1",
};

export interface SamplesProps extends React.ComponentProps<"div"> {
  /** The minimum card width the grid packs. */
  columns?: keyof typeof samplesColumns;
}

/**
 * The card grid of a gallery section. The section heading is the page's `h1`
 * in the Astro page, so the cards inside take the next level.
 */
export function Samples({
  columns = "auto",
  className,
  ...props
}: SamplesProps) {
  return (
    <HeadingLevel level={2}>
      <div
        className={clsx(
          "grid items-start gap-4",
          samplesColumns[columns],
          className,
        )}
        {...props}
      />
    </HeadingLevel>
  );
}

// The card title is a node rather than the tooltip string the HTML attribute
// takes, so the attribute is dropped from the frame props.
export interface SampleProps extends Omit<FrameProps, "title"> {
  title: React.ReactNode;
  /** The props or classes the sample exercises, shown as a code chip. */
  code?: React.ReactNode;
  description?: React.ReactNode;
  /** Whether the card spans every column of the grid. */
  wide?: boolean;
}

/**
 * One gallery card: a framed surface with a title, an optional code chip and
 * description, and the sample itself below them.
 */
export function Sample({
  title,
  code,
  description,
  wide,
  className,
  children,
  ...props
}: SampleProps) {
  return (
    <Frame
      render={<article />}
      $rounded="2xl"
      $p={4}
      $border
      className={clsx(
        "grid min-w-0 content-start gap-4",
        wide && "col-span-full",
        className,
      )}
      {...props}
    >
      <header className="grid gap-1.5">
        <Heading $level={5} className="mt-0 mb-0 font-semibold">
          {title}
        </Heading>
        {code != null && (
          <Code className="w-fit max-w-full text-xs [overflow-wrap:anywhere]">
            {code}
          </Code>
        )}
        {description != null && <Caption>{description}</Caption>}
      </header>
      {children}
    </Frame>
  );
}

export interface StageProps extends React.ComponentProps<"div"> {
  /** Whether the items flow in wrapping rows or stack in a column. */
  direction?: "row" | "column";
}

/**
 * The area of a card that holds the rendered components, as wrapping rows
 * of centered items or a stretched column.
 */
export function Stage({ direction = "row", className, ...props }: StageProps) {
  return (
    <div
      className={clsx(
        "flex min-w-0 gap-3",
        direction === "row"
          ? "flex-wrap items-center"
          : "flex-col items-stretch",
        className,
      )}
      {...props}
    />
  );
}

export interface CaptionProps extends TextProps {}

/**
 * Secondary text that explains a row or an item without competing with it.
 */
export function Caption(props: CaptionProps) {
  return (
    <Text
      {...props}
      className={clsx("ak-ink-70 text-sm text-pretty", props.className)}
    />
  );
}

export interface LabeledProps extends React.ComponentProps<"div"> {
  label: React.ReactNode;
}

/**
 * Stacks a small caption over one item, for matrices where each cell needs
 * a name.
 */
export function Labeled({
  label,
  className,
  children,
  ...props
}: LabeledProps) {
  return (
    <div className={clsx("grid min-w-0 gap-1.5", className)} {...props}>
      <Text className="ak-ink-60 text-xs">{label}</Text>
      {children}
    </div>
  );
}

export interface SwatchGridProps extends React.ComponentProps<"div"> {
  /** The minimum swatch width the grid packs. */
  min?: string;
}

/**
 * Packs swatches into as many columns as fit the card.
 */
export function SwatchGrid({
  min = "8rem",
  className,
  style,
  ...props
}: SwatchGridProps) {
  return (
    <div
      className={clsx(
        "grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(100%,var(--swatch-min)),1fr))]",
        className,
      )}
      style={{ "--swatch-min": min, ...style } as React.CSSProperties}
      {...props}
    />
  );
}

export interface SwatchProps extends LayerProps {
  label: React.ReactNode;
  code?: React.ReactNode;
}

/**
 * A layer painted large enough to read its color, with its name and the
 * props that produced it.
 */
export function Swatch({ label, code, className, ...props }: SwatchProps) {
  return (
    <Layer
      className={clsx(
        "grid min-h-28 min-w-0 content-between gap-3 rounded-xl p-4 ring ring-inset",
        className,
      )}
      {...props}
    >
      <Text className="font-medium">{label}</Text>
      {code != null && (
        <Code className="w-fit max-w-full text-xs [overflow-wrap:anywhere]">
          {code}
        </Code>
      )}
    </Layer>
  );
}

export interface PlaceholderProps extends LayerProps {}

/**
 * A block of filler surface for compositions that only need something to
 * lay out.
 */
export function Placeholder(props: PlaceholderProps) {
  return (
    <Layer
      $lightnessOffset
      {...props}
      className={clsx("min-h-10 rounded-lg", props.className)}
    />
  );
}
