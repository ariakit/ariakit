/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { Caption, Sample, Samples } from "./gallery.react.tsx";

const visualLevels = [1, 2, 3, 4, 5] as const;

export function HeadingSection() {
  return (
    <Samples>
      <Sample
        title="Semantic levels"
        code="HeadingLevel → Heading renders h1 to h6"
        description="There is no level prop. Each HeadingLevel nests one level deeper, and every element takes the size of its own step. An h6 declares no size and keeps the surrounding text size."
      >
        <div className="grid">
          <HeadingLevel level={1}>
            <Heading className="mt-0">Level one</Heading>
            <HeadingLevel>
              <Heading>Level two</Heading>
              <HeadingLevel>
                <Heading>Level three</Heading>
                <HeadingLevel>
                  <Heading>Level four</Heading>
                  <HeadingLevel>
                    <Heading>Level five</Heading>
                    <HeadingLevel>
                      <Heading>Level six</Heading>
                    </HeadingLevel>
                  </HeadingLevel>
                </HeadingLevel>
              </HeadingLevel>
            </HeadingLevel>
          </HeadingLevel>
        </div>
      </Sample>

      <Sample
        title="Visual level"
        code="$level={1 | 2 | 3 | 4 | 5}"
        description="Every heading here is an h3. The variant sets the size when the design step and the semantic level disagree."
      >
        <div className="grid">
          {visualLevels.map((level) => (
            <Heading key={level} $level={level} className="mt-0 mb-2">
              Visual level {level}
            </Heading>
          ))}
        </div>
      </Sample>

      <Sample
        title="Flow margins"
        code="Heading after text · heading after heading · first heading"
        description="A heading sits away from the text above it, closer to a heading directly above it, and flush when nothing precedes it."
      >
        <Prose>
          <HeadingLevel level={2}>
            <Heading>First heading, no top margin</Heading>
            <HeadingLevel>
              <Heading>A subheading right under it</Heading>
            </HeadingLevel>
            <p>A paragraph of running text between the headings.</p>
            <HeadingLevel>
              <Heading>A heading after a paragraph</Heading>
            </HeadingLevel>
            <p>The rhythm of the column comes from the prose around it.</p>
          </HeadingLevel>
        </Prose>
      </Sample>

      <Sample
        title="Colors and layers"
        code='$text="brand" · inside Layer'
        description="Headings take the text variants and read their ink from the layer behind them."
      >
        <div className="grid gap-3">
          <Heading $level={3} $text="brand" className="mt-0 mb-0">
            Brand heading
          </Heading>
          <Heading $level={3} $text="danger" className="mt-0 mb-0">
            Danger heading
          </Heading>
          <Layer $invert className="grid gap-1 rounded-xl p-4">
            <Heading $level={3} className="mt-0 mb-0">
              Heading on an inverted layer
            </Heading>
            <Caption>The ink flips with the layer.</Caption>
          </Layer>
          <Layer $layer="brand" className="grid gap-1 rounded-xl p-4">
            <Heading $level={3} className="mt-0 mb-0">
              Heading on a brand layer
            </Heading>
            <Caption>The caption is muted against the same layer.</Caption>
          </Layer>
        </div>
      </Sample>

      <Sample
        title="Permalink anchors"
        code="Heading > a"
        description="A link inside a heading takes the heading's own look and only underlines on hover."
      >
        <div className="grid">
          <Heading $level={2} className="mt-0 mb-0">
            <a href="#heading">Anchored heading</a>
          </Heading>
          <Heading $level={4} className="mb-0">
            <a href="#heading">A smaller anchored heading</a>
          </Heading>
        </div>
      </Sample>
    </Samples>
  );
}
