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
import { Heading } from "@ariakit/ui/components/heading.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
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
  "text-lg",
  "text-2xl",
] as const;

export function CodeSection() {
  return (
    <Samples>
      <Sample
        title="Inline"
        code="Code inside running text"
        description="The chip pins its x-height to the text around it, so it keeps one optical size in any font."
      >
        <p>
          Install <Code>@ariakit/ui</Code>, then import <Code>Button</Code> from{" "}
          <Code>@ariakit/ui/components/button.ariakit.react.tsx</Code> and pass{" "}
          <Code>$kind="bevel"</Code> to raise it.
        </p>
      </Sample>

      <Sample
        title="Scale"
        code="text-xs to text-2xl"
        description="Drawn in em, the chip scales with the font size it inherits."
      >
        <Stage>
          {textSizes.map((size) => (
            <span key={size} className={size}>
              <Code>{size}</Code>
            </span>
          ))}
          <Heading $level={3} className="mt-0 mb-0">
            Heading with <Code>Code</Code>
          </Heading>
        </Stage>
      </Sample>

      <Sample
        title="Layer and edge"
        code="$lightnessOffset={3} · $edgeWeight={40} · $layer · $edge"
        description="The chip is an edge surface: its ring and its layer take every layer and edge knob."
      >
        <Stage>
          <Labeled label="Default">
            <Code>default</Code>
          </Labeled>
          <Labeled label="Offset 3">
            <Code $lightnessOffset={3}>offset</Code>
          </Labeled>
          <Labeled label="Edge 40">
            <Code $edgeWeight={40}>edge</Code>
          </Labeled>
          <Labeled label="Brand layer">
            <Code $layer="brand" $mix={25}>
              brand
            </Code>
          </Labeled>
          <Labeled label="Danger layer">
            <Code $layer="danger" $mix={25}>
              danger
            </Code>
          </Labeled>
          <Labeled label="Brand edge">
            <Code $edge="brand" $edgeWeight="bold">
              edge
            </Code>
          </Labeled>
          <Labeled label="Transparent">
            <Code $layer="transparent">transparent</Code>
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="On layers"
        code="Code inside Layer"
        description="The chip lifts off whatever surface it sits on and keeps the surrounding ink for its text."
      >
        <SwatchGrid min="9rem">
          <Layer $lightnessOffset={2} className="rounded-xl p-4 text-sm">
            Offset with <Code>Code</Code>
          </Layer>
          <Layer $invert className="rounded-xl p-4 text-sm">
            Inverted with <Code>Code</Code>
          </Layer>
          <Layer $layer="brand" className="rounded-xl p-4 text-sm">
            Brand with <Code>Code</Code>
          </Layer>
          <Layer $layer="success" className="rounded-xl p-4 text-sm">
            Success with <Code>Code</Code>
          </Layer>
        </SwatchGrid>
      </Sample>

      <Sample
        title="Long content"
        code="Code wrapping inside a narrow column"
        description="A long chip breaks where the text does, keeping its ring around every line."
      >
        <p className="max-w-64 text-sm">
          The import path{" "}
          <Code>@ariakit/ui/react-utils/disclosure-indicator.react.tsx</Code>{" "}
          wraps onto the next line.
        </p>
      </Sample>
    </Samples>
  );
}
