/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import {
  Labeled,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

const textSizes = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-xl",
  "text-3xl",
] as const;

function Shortcut() {
  return (
    <span className="inline-flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>P</Kbd>
    </span>
  );
}

export function KbdSection() {
  return (
    <Samples>
      <Sample
        title="Keys"
        code="Kbd"
        description="Single keys, modifier names and a sequence inside a sentence."
      >
        <Stage>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Space</Kbd>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <Kbd>Fn</Kbd>
        </Stage>
        <p className="text-sm">
          Press <Shortcut /> to open the command palette, then <Kbd>Esc</Kbd> to
          close it.
        </p>
      </Sample>

      <Sample
        title="Scale"
        code="text-xs to text-3xl"
        description="Every measurement is in em, so the cap follows the font size around it."
      >
        <Stage className="items-end">
          {textSizes.map((size) => (
            <span
              key={size}
              className={`${size} inline-flex items-center gap-1`}
            >
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          ))}
        </Stage>
      </Sample>

      <Sample
        title="Layer and edge"
        code="$layer · $edge · $edgeWeight · $edgeHue · $lightnessOffset"
        description="The cap is an edge surface. Its face, lip and ring take the layer and edge knobs, and every one holds in both schemes."
      >
        <Stage>
          <Labeled label="Default">
            <Kbd>Esc</Kbd>
          </Labeled>
          <Labeled label="Brand layer">
            <Kbd $layer="brand">⌘</Kbd>
          </Labeled>
          <Labeled label="Danger layer">
            <Kbd $layer="danger">Del</Kbd>
          </Labeled>
          <Labeled label="Brand edge">
            <Kbd $edge="brand">Tab</Kbd>
          </Labeled>
          <Labeled label="Weight 40">
            <Kbd $edgeWeight={40}>⇧</Kbd>
          </Labeled>
          <Labeled label="Adaptive">
            <Kbd $edgeWeight="adaptive">⌥</Kbd>
          </Labeled>
          <Labeled label="Green vivid">
            <Kbd $edgeHue="green" $edgeChroma="vivid">
              ↵
            </Kbd>
          </Labeled>
          <Labeled label="Offset 5">
            <Kbd $lightnessOffset={5}>Fn</Kbd>
          </Labeled>
          <Labeled label="Inverted">
            <Kbd $invert>⌫</Kbd>
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="On layers"
        code="Kbd inside Layer"
        description="The cap redraws for dark surfaces: the top highlight goes and the lip carries the depth."
      >
        <SwatchGrid min="9rem">
          <Layer $lightnessOffset={2} className="rounded-xl p-4 text-sm">
            Offset <Shortcut />
          </Layer>
          <Layer $invert className="rounded-xl p-4 text-sm">
            Inverted <Shortcut />
          </Layer>
          <Layer $layer="brand" className="rounded-xl p-4 text-sm">
            Brand <Shortcut />
          </Layer>
          <Layer $layer="#111827" className="rounded-xl p-4 text-sm">
            Near black <Shortcut />
          </Layer>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
