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
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

export default function SeparatorExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="A dashed rule at medium edge weight. In a Prose column it adds half the column gap on each side, on top of the gap itself."
        stretch
        code={`
          <Prose>
            …
            <Separator />
            …
          </Prose>
        `}
      >
        <Prose>
          <p>A paragraph before the rule.</p>
          <Separator />
          <p>A paragraph after the rule.</p>
        </Prose>
      </Example>

      <Example
        title="Solid line"
        description="The rule draws one solid line instead of dashes."
        stretch
        code={`
          <Prose>
            …
            <Separator $line="solid" />
            …
          </Prose>
        `}
      >
        <Prose>
          <p>A paragraph before the rule.</p>
          <Separator $line="solid" />
          <p>A paragraph after the rule.</p>
        </Prose>
      </Example>

      <Example
        title="Dotted line"
        description="The rule draws a line of dots instead of dashes."
        stretch
        code={`
          <Prose>
            …
            <Separator $line="dotted" />
            …
          </Prose>
        `}
      >
        <Prose>
          <p>A paragraph before the rule.</p>
          <Separator $line="dotted" />
          <p>A paragraph after the rule.</p>
        </Prose>
      </Example>

      <Example
        title="Light weight"
        description="The faintest visible weight, for rules that must not compete with the text."
        stretch
        code={`
          <Prose>
            …
            <Separator $edgeWeight="light" />
            …
          </Prose>
        `}
      >
        <Prose>
          <p>A paragraph before the rule.</p>
          <Separator $edgeWeight="light" />
          <p>A paragraph after the rule.</p>
        </Prose>
      </Example>

      <Example
        title="Bold weight"
        description="A stronger weight, for rules that must stand out from the text."
        stretch
        code={`
          <Prose>
            …
            <Separator $edgeWeight="bold" />
            …
          </Prose>
        `}
      >
        <Prose>
          <p>A paragraph before the rule.</p>
          <Separator $edgeWeight="bold" />
          <p>A paragraph after the rule.</p>
        </Prose>
      </Example>

      <Example
        title="Brand rule"
        description="A raw edge paints the brand color exactly as given, at full alpha. Without it, the rule shows the brand color at the medium weight."
        stretch
        code={`
          <Prose>
            …
            <Separator $edge="brand" $edgeRaw $line="solid" />
            …
          </Prose>
        `}
      >
        <Prose>
          <p>A paragraph before the rule.</p>
          <Separator $edge="brand" $edgeRaw $line="solid" />
          <p>A paragraph after the rule.</p>
        </Prose>
      </Example>

      {/*
        The variant acts only on a mid-dark layer (the ak-dark-low band, from
        about 0.28 to 0.55 lightness), not on the darker canvas of the dark
        theme, so the box paints a mid-dark panel in every theme.
      */}
      <Example
        title="Dark dividers"
        description="On a mid-dark surface the rule turns almost black, as in native dark interfaces."
        stretch
        code={`
          <Frame $layer="var(--color-gray-700)" $rounded="xl" $p={4}>
            <Prose>
              …
              <Separator $edgeDark />
              …
            </Prose>
          </Frame>
        `}
      >
        <Frame $layer="var(--color-gray-700)" $rounded="xl" $p={4}>
          <Prose>
            <p>A paragraph before the rule.</p>
            <Separator $edgeDark />
            <p>A paragraph after the rule.</p>
          </Prose>
        </Frame>
      </Example>

      <Example
        title="Tight column"
        description="The rule reads the gap of the column around it, so its margins shrink in a tighter column."
        stretch
        code={`
          <Prose $gap={3}>
            …
            <Separator />
            …
          </Prose>
        `}
      >
        <Prose $gap={3}>
          <p>A paragraph before the rule.</p>
          <Separator />
          <p>A paragraph after the rule.</p>
        </Prose>
      </Example>

      <Example
        title="Explicit gap"
        description="A set gap replaces the half-rhythm margin of the rule. The column gap still applies on top of it."
        stretch
        code={`
          <Prose>
            …
            <Separator $gap={8} />
            …
          </Prose>
        `}
      >
        <Prose>
          <p>A paragraph before the rule.</p>
          <Separator $gap={8} />
          <p>A paragraph after the rule.</p>
        </Prose>
      </Example>

      <Example
        title="Before a heading"
        description="The next element drops its own top margin, so a section heading sits as far below the rule as the paragraph sits above it."
        stretch
        code={`
          <Prose>
            …
            <Separator />
            <HeadingLevel>
              <Heading>Section heading</Heading>
            </HeadingLevel>
            …
          </Prose>
        `}
      >
        <Prose>
          <p>A paragraph before the rule.</p>
          <Separator />
          {/*
            Heading takes its element from the surrounding context. This one
            resolves to an h4, which still has a size step of its own, so the
            dropped top margin shows.
          */}
          <HeadingLevel>
            <Heading>Section heading</Heading>
          </HeadingLevel>
          <p>A paragraph after the heading.</p>
        </Prose>
      </Example>

      <Example
        title="Outside a prose column"
        description="Without a Prose column around it, the rule falls back to a fixed margin on each side."
        stretch
        code={`
          …
          <Separator />
          …
        `}
      >
        <div>
          <p>A paragraph before the rule.</p>
          <Separator />
          <p>A paragraph after the rule.</p>
        </div>
      </Example>

      <Example
        title="On a brand layer"
        description="The rule has a transparent layer of its own, so its edge adapts to the brand surface behind it."
        stretch
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <Prose>
              …
              <Separator />
              …
            </Prose>
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4}>
          <Prose>
            <p>A paragraph before the rule.</p>
            <Separator />
            <p>A paragraph after the rule.</p>
          </Prose>
        </Frame>
      </Example>
    </ExampleGrid>
  );
}
