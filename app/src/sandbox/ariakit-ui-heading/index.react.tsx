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
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

// Every box title is an h2 and its example sits one HeadingLevel below it, so a
// bare Heading in a box is an h3, and the h1 size step shows through $level.
export default function HeadingExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Semantic levels"
        description="Each HeadingLevel goes one level deeper, from h3 to h6. Each element sets its own size. The h5 and the h6 keep the size of the text around them."
        stretch
        code={`
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
        `}
      >
        {/*
          Block flow, so the gaps between the headings are their own flow
          margins and not a flex gap.
        */}
        <div>
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
        </div>
      </Example>

      <Example
        title="Visual level"
        description="The element stays an h4, and the variant gives it the size of the h2 step. The document outline does not change."
        code={`
          <HeadingLevel>
            <Heading $level={2}>An h4 at the h2 size</Heading>
          </HeadingLevel>
        `}
      >
        <HeadingLevel>
          <Heading $level={2}>An h4 at the h2 size</Heading>
        </HeadingLevel>
      </Example>

      <Example
        title="Size override"
        description="A text-sm class replaces the size step of this h3. The heading takes the font size and the line height of that class."
        code={`
          <Heading>A small section title</Heading>
        `}
      >
        <Heading className="text-sm">A small section title</Heading>
      </Example>

      <Example
        title="Wrapped title"
        description="A long title at the h1 size wraps onto more than one line. The heading uses a tighter line height of 1.25."
        code={`
          <Heading $level={1}>…</Heading>
        `}
      >
        <Heading $level={1} className="max-w-sm">
          A long page title that wraps onto a second and a third line
        </Heading>
      </Example>

      <Example
        title="Flow margins"
        description="The first heading has no top margin. A heading directly under a heading sits closer to it than a heading after a paragraph."
        stretch
        code={`
          <Prose>
            <Heading>First heading</Heading>
            <HeadingLevel>
              <Heading>A heading right under it</Heading>
            </HeadingLevel>
            …
            <HeadingLevel>
              <Heading>…</Heading>
            </HeadingLevel>
            …
          </Prose>
        `}
      >
        <Prose>
          <Heading>First heading</Heading>
          <HeadingLevel>
            <Heading>A heading right under it</Heading>
          </HeadingLevel>
          <p>A paragraph of running text between the headings.</p>
          <HeadingLevel>
            <Heading>A heading after a paragraph</Heading>
          </HeadingLevel>
          <p>The rhythm of the column comes from the prose around it.</p>
        </Prose>
      </Example>

      <Example
        title="Brand text"
        description="The brand text color replaces the heading ink and keeps its contrast on every page surface."
        code={`
          <Heading $text="brand">Brand heading</Heading>
        `}
      >
        <Heading $text="brand">Brand heading</Heading>
      </Example>

      <Example
        title="Accent hue"
        description="The text hue moves the brand color to its complementary hue. The heading keeps its contrast on every page surface."
        code={`
          <Heading $text="brand" $textHue="complementary">Release highlights</Heading>
        `}
      >
        <Heading $text="brand" $textHue="complementary">
          Release highlights
        </Heading>
      </Example>

      <Example
        title="On an inverted layer"
        description="The heading ink follows the layer behind it. A heading that is the only child has no margins, so the padding stays even."
        stretch
        code={`
          <Frame $invert $rounded="xl" $p={4}>
            <Heading>Inverted heading</Heading>
          </Frame>
        `}
      >
        <Frame $invert $rounded="xl" $p={4}>
          <Heading>Inverted heading</Heading>
        </Frame>
      </Example>

      <Example
        title="Permalink"
        description="A link in a heading takes the color and the weight of the heading. It shows an underline only on hover."
        code={`
          <Heading>
            <Link>Anchored heading</Link>
          </Heading>
        `}
      >
        <Heading id="permalink">
          <Link href="#permalink">Anchored heading</Link>
        </Heading>
      </Example>
    </ExampleGrid>
  );
}
