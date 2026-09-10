/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import * as icons from "lucide-react";
import {
  Labeled,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

export function LinkSection() {
  return (
    <Samples>
      <Sample
        title="Inline"
        code="Link inside running text"
        description="The default link is a brand tint with a thin underline that thickens on hover. Its hit area grows past the line without moving the text."
      >
        <Prose>
          <p>
            Read the <Link href="#link">styling guide</Link> first, then the{" "}
            <Link href="#link">composition patterns</Link>. Every example links
            back to its <Link href="#link">source on GitHub</Link>.
          </p>
        </Prose>
      </Sample>

      <Sample
        title="Colors"
        code='$text="danger" | "success" | "secondary" | "#d946ef"'
        description="A text color replaces the brand tint and still lightens on dark layers."
      >
        <Stage>
          <Link href="#link">Brand</Link>
          <Link href="#link" $text="danger">
            Danger
          </Link>
          <Link href="#link" $text="success">
            Success
          </Link>
          <Link href="#link" $text="secondary">
            Secondary
          </Link>
          <Link href="#link" $text="#d946ef">
            Custom
          </Link>
          <Link href="#link" $text>
            Derived
          </Link>
          <Link href="#link" $textPush={60}>
            Pushed 60
          </Link>
        </Stage>
      </Sample>

      <Sample
        title="Focus"
        code="$focus={1 | 2 | 3} · $focusOffset={2} · $focusColor"
        description="Tab through the links to compare the rings. The offset is off by default because the padding already holds the ring off the text."
      >
        <Stage>
          <Labeled label="1">
            <Link href="#link" $focus={1}>
              Thin ring
            </Link>
          </Labeled>
          <Labeled label="2">
            <Link href="#link" $focus={2}>
              Default ring
            </Link>
          </Labeled>
          <Labeled label="3">
            <Link href="#link" $focus={3}>
              Thick ring
            </Link>
          </Labeled>
          <Labeled label="Offset 2">
            <Link href="#link" $focusOffset={2}>
              Offset ring
            </Link>
          </Labeled>
          <Labeled label="No ring">
            <Link href="#link" $focus={false}>
              No ring
            </Link>
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="With an icon and as a button"
        code="Link > svg · render={<button />}"
        description="An icon inside the link takes the link color. A button rendered as a link keeps the link look for in-page actions."
      >
        <Stage>
          <Link
            href="https://ariakit.com"
            className="inline-flex items-center gap-1"
          >
            ariakit.com
            <icons.ArrowUpRight className="size-[1em]" />
          </Link>
          <Link render={<button type="button" />}>Copy link</Link>
          <Link href="#link" className="inline-flex items-center gap-1">
            <icons.FileCode className="size-[1em]" />
            Source
          </Link>
        </Stage>
      </Sample>

      <Sample
        title="On layers"
        code="Link inside Layer"
        description="On a dark layer the tint is pushed lighter so the link stays a color rather than a saturated slab."
      >
        <SwatchGrid min="10rem">
          <Layer $lightnessOffset={2} className="rounded-xl p-4 text-sm">
            An offset layer with a <Link href="#link">link</Link> in it.
          </Layer>
          <Layer $invert className="rounded-xl p-4 text-sm">
            An inverted layer with a <Link href="#link">link</Link> in it.
          </Layer>
          <Layer $layer="brand" className="rounded-xl p-4 text-sm">
            A brand layer with a <Link href="#link">link</Link> and a{" "}
            <Link href="#link" $text="danger">
              danger link
            </Link>
            .
          </Layer>
          <Layer $layer="#111827" className="rounded-xl p-4 text-sm">
            A near-black layer with a <Link href="#link">link</Link> in it.
          </Layer>
        </SwatchGrid>
      </Sample>

      <Sample
        title="Wrapping"
        code="A long link across lines"
        description="The underline and hover weight follow every line of a wrapped link."
      >
        <p className="max-w-64 text-sm">
          <Link href="#link">
            A link long enough to wrap onto a second and a third line inside a
            narrow column
          </Link>
          .
        </p>
      </Sample>
    </Samples>
  );
}
