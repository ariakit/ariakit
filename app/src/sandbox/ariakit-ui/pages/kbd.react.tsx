/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Example, ExampleGrid } from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";

export function KbdExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="Symbol, letter and word keys in a narrow paragraph that wraps. The caps do not change the line spacing of the paragraph."
      >
        <p className="max-w-56 text-sm">
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search, <Kbd>↑</Kbd> and{" "}
          <Kbd>↓</Kbd> to move, <Kbd>Enter</Kbd> to pick and <Kbd>Esc</Kbd> to
          close the list.
        </p>
      </Example>

      <Example
        title="Shortcut list"
        description="Key combinations as flex items in a shortcut reference. Each cap keeps its own height instead of the line height of the row."
      >
        <dl className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 text-sm">
          <dt>Open command palette</dt>
          <dd className="inline-flex gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </dd>
          <dt>Save</dt>
          <dd className="inline-flex gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </dd>
          <dt>Close</dt>
          <dd className="inline-flex gap-1">
            <Kbd>Esc</Kbd>
          </dd>
        </dl>
      </Example>

      <Example
        title="Small text"
        description="In text-xs, the hairline, the lip and the ring keep a visible minimum width, and the lip stays thicker than the hairline."
      >
        <p className="text-xs">
          Press <Kbd>Esc</Kbd> to close
        </p>
      </Example>

      <Example
        title="Large text"
        description="In text-3xl, the padding, the corners, the lip and the ring all scale with the font."
      >
        <p className="text-3xl">
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd>
        </p>
      </Example>

      <Example
        title="Brand cap"
        description="The face, the dish gradient, the lip and the ring all come from the brand layer. A dark face gets the drawing of a dark cap."
      >
        <p className="text-sm">
          Press <Kbd $layer="brand">⌘</Kbd> <Kbd $layer="brand">K</Kbd>
        </p>
      </Example>

      <Example
        title="Inverted cap"
        description="The face takes the opposite scheme of the page, and the cap draws itself for its own face, not for the page."
      >
        <p className="text-sm">
          Press <Kbd $invert>Esc</Kbd> to close
        </p>
      </Example>

      <Example
        title="Transparent cap"
        description="The cap paints no face of its own. The lip, the dish and the ring still draw its outline."
      >
        <p className="text-sm">
          Press <Kbd $layer="transparent">Tab</Kbd> to move
        </p>
      </Example>

      <Example
        title="Brand edge"
        description="Only the ring takes the edge color. The lip follows the face, so it stays neutral."
      >
        <p className="text-sm">
          Press <Kbd $edge="brand">Tab</Kbd> to move
        </p>
      </Example>

      <Example
        title="Raw brand edge"
        description="The ring uses the brand color exactly as given, without the cap's default lightening and alpha."
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $edge="brand" $edgeRaw>
            Tab
          </Kbd>{" "}
          to move
        </p>
      </Example>

      <Example
        title="Fixed edge weight"
        description="An explicit weight replaces both scheme defaults, so the ring has the same strength on light and dark surfaces."
      >
        <p className="text-sm">
          Hold <Kbd $edgeWeight={40}>Shift</Kbd> to select a range
        </p>
      </Example>

      <Example
        title="On a brand layer"
        description="On a saturated dark surface, the caps take the brand hue and the drawing of a dark cap: no top highlight, a shallower lip cut and a lifted ring."
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="text-sm">
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search
        </Frame>
      </Example>

      <Example
        title="On an inverted layer"
        description="The caps follow the surface they sit on, not the page theme: the dark drawing on a light page, and the light drawing on a dark page."
      >
        <Frame $invert $rounded="xl" $p={4} className="text-sm">
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search
        </Frame>
      </Example>
    </ExampleGrid>
  );
}

export default createGalleryPage("kbd", KbdExamples);
