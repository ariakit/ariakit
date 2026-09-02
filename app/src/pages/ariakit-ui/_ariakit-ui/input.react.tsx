/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Input } from "@ariakit/ui/components/input.ariakit.react.tsx";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import { Text } from "@ariakit/ui/components/text.ariakit.react.tsx";
import * as icons from "lucide-react";
import {
  Caption,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

export function InputSection() {
  return (
    <Samples>
      <Sample
        title="States"
        code="placeholder · defaultValue · disabled · readOnly · aria-invalid"
        description="A field sinks into the surface where a button rises off it. Hover pulls it back toward the layer."
      >
        <Stage direction="column">
          <Input placeholder="Placeholder" />
          <Input defaultValue="A value" />
          <Input placeholder="Disabled" disabled />
          <Input defaultValue="Read only" readOnly />
          <Input
            defaultValue="not an email"
            aria-invalid="true"
            $edge="danger"
            $edgeWeight="bold"
          />
        </Stage>
      </Sample>

      <Sample
        title="Edge"
        code='$edgeWeight={15 | 30 | 50} · $edge="brand"'
        description="The default weight sits between medium and bold, stronger than a frame's."
      >
        <Stage direction="column">
          <Input placeholder="$edgeWeight={15}" $edgeWeight={15} />
          <Input placeholder="$edgeWeight={30}, the default" />
          <Input placeholder="$edgeWeight={50}" $edgeWeight={50} />
          <Input placeholder='$edge="brand"' $edge="brand" />
          <Input placeholder='$borderType="dashed"' $borderType="dashed" />
        </Stage>
      </Sample>

      <Sample
        title="Radius and padding"
        code='$rounded="md" | "lg" | "xl" | "full" · $p={2 | 3 | 4}'
        description="The default is a large radius with three steps of padding."
      >
        <Stage direction="column">
          <Input placeholder='$rounded="md"' $rounded="md" />
          <Input placeholder='$rounded="xl"' $rounded="xl" />
          <Input placeholder='$rounded="full"' $rounded="full" />
          <Input placeholder="$p={2}" $p={2} />
          <Input placeholder="$p={4}" $p={4} />
        </Stage>
      </Sample>

      <Sample
        title="Focus"
        code="$focus={1 | 2 | 3} · $focusOffset={1} · $focus={false}"
        description="Tab through the fields. The ring is tucked inside the border by default so the two read as one edge."
      >
        <Stage direction="column">
          <Input placeholder="$focus={1}" $focus={1} />
          <Input placeholder="$focus={2}, the default" />
          <Input placeholder="$focus={3}" $focus={3} />
          <Input placeholder="$focusOffset={1}" $focusOffset={1} />
          <Input placeholder="$focus={false}" $focus={false} />
        </Stage>
      </Sample>

      <Sample
        title="Sizes"
        code='className="text-sm" | "text-lg"'
        description="The field has no size variant. Its padding and radius are in em, so the font size scales the whole box."
      >
        <Stage direction="column">
          <Input placeholder="text-xs" className="text-xs" />
          <Input placeholder="text-sm" className="text-sm" />
          <Input placeholder="text-base" />
          <Input placeholder="text-lg" className="text-lg" />
          <Input placeholder="text-xl" className="text-xl" />
        </Stage>
      </Sample>

      <Sample
        title="Wrappers"
        code="Input render={<label />} focusable={false} > input"
        description="The field style on a label around a plain input, so a prefix, a suffix or a keyboard hint share the box. Focus rings through the wrapper."
      >
        <Stage direction="column">
          <Input
            render={<label />}
            focusable={false}
            $p={1}
            className="flex items-center justify-end-safe gap-1"
          >
            <Text className="ak-ink-60 ps-2">€</Text>
            <input
              className="min-w-0 flex-1 text-end"
              defaultValue="24"
              aria-label="Price"
            />
          </Input>
          <Input
            render={<label />}
            focusable={false}
            $p={2}
            className="flex items-center gap-2"
          >
            <icons.Search className="ak-ink-60 size-[1em] flex-none" />
            <input
              className="min-w-0 flex-1"
              placeholder="Search components"
              aria-label="Search"
            />
            <Kbd>/</Kbd>
          </Input>
          <Input
            render={<label />}
            focusable={false}
            $p={2}
            className="flex items-center gap-2"
          >
            <Text className="ak-ink-60">https://</Text>
            <input
              className="min-w-0 flex-1"
              defaultValue="ariakit.com"
              aria-label="Domain"
            />
            <Button $size="sm" $rounded="md" $p={1} $px="md">
              Copy
            </Button>
          </Input>
        </Stage>
      </Sample>

      <Sample
        title="Fake field"
        code='Input render={<button type="button" />} + placeholder ink + Kbd'
        description="A button styled as an empty field, for a search trigger that opens a dialog."
      >
        <Stage direction="column">
          <Input
            render={<button type="button" />}
            $p={2}
            $edgeWeight={15}
            className="flex h-10 w-full items-center gap-2 text-start text-sm"
          >
            <Text className="ak-ink-0 flex-1 truncate">
              Search API reference
            </Text>
            <Kbd className="grid h-full place-items-center">K</Kbd>
          </Input>
          <Input
            render={<button type="button" />}
            $rounded="full"
            className="flex items-center gap-2 text-start"
          >
            <icons.Sparkles className="ak-ink-60 size-[1em] flex-none" />
            <Text className="ak-ink-0 flex-1 truncate">Ask a question</Text>
            <Kbd>↵</Kbd>
          </Input>
        </Stage>
      </Sample>

      <Sample
        title="Textarea and labels"
        code="render={<textarea />} · label above the field"
        description="A multi-line field on the same recipe, and a labeled pair as a form would compose it."
      >
        <Stage direction="column">
          <div className="grid gap-1.5">
            <Text
              render={<label htmlFor="gallery-input-name" />}
              className="text-sm font-medium"
            >
              Name
            </Text>
            <Input id="gallery-input-name" placeholder="Ada Lovelace" />
            <Caption>A hint below the field.</Caption>
          </div>
          <div className="grid gap-1.5">
            <Text
              render={<label htmlFor="gallery-input-notes" />}
              className="text-sm font-medium"
            >
              Notes
            </Text>
            <Input
              id="gallery-input-notes"
              render={<textarea rows={3} />}
              placeholder="A few lines of text"
              className="resize-y leading-normal"
            />
          </div>
        </Stage>
      </Sample>

      <Sample
        title="On layers"
        code="Input inside Layer"
        description="The field sinks the other way on dark layers, and the hover state still pulls it back."
      >
        <SwatchGrid min="12rem">
          <Layer $lightnessOffset={2} className="grid gap-2 rounded-xl p-4">
            <Caption>Offset</Caption>
            <Input placeholder="Placeholder" />
            <Input defaultValue="Value" />
          </Layer>
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <Input placeholder="Placeholder" />
            <Input defaultValue="Value" />
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <Input placeholder="Placeholder" />
            <Input defaultValue="Value" disabled />
          </Layer>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
