/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Code } from "@ariakit/ui/components/code.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Example, ExampleGrid, screenshotFocus } from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";

export function CodeExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="Chips in body text. The chip is a little darker than the surface in light mode and a little lighter in dark mode, and it keeps the ink of the text around it."
      >
        <p>
          Install <Code>@ariakit/ui</Code>, then import <Code>Button</Code> and
          pass <Code>$kind="bevel"</Code> to it.
        </p>
      </Example>

      <Example
        title="In a heading"
        description="The chip is drawn in em, so it follows a larger and heavier font."
      >
        <Heading>
          The <Code>Button</Code> component
        </Heading>
      </Example>

      <Example
        title="In secondary text"
        description="In text-xs with a lighter ink, the chip shrinks with the text and keeps the lighter ink."
      >
        <p className="ak-ink-70 text-xs">
          Set <Code>$edgeWeight</Code> to change the ring.
        </p>
      </Example>

      <Example
        title="In a link"
        description="The chip takes the link color, and the link underline runs through it."
      >
        <p>
          Read the{" "}
          <Link href="#use-dialog-store" {...screenshotFocus}>
            <Code>useDialogStore</Code>
          </Link>{" "}
          reference.
        </p>
      </Example>

      <Example
        title="On a brand layer"
        description="On a saturated surface, the chip stays separate from the surface and keeps the light ink of that surface."
      >
        <Frame $layer="brand" $rounded="xl" $p={4}>
          Run <Code>pnpm install</Code> to set up the project.
        </Frame>
      </Example>

      <Example
        title="Colored layer"
        description="A color tints the chip, and the chip text takes the ink that the chip's own surface needs."
      >
        <p>
          Removed in v2: <Code $layer="danger">$kind="flat"</Code>
        </p>
      </Example>

      <Example
        title="Inverted"
        description="The chip takes the opposite scheme of the surface under it, and its text takes the ink of that scheme."
      >
        <p>
          Run <Code $invert>pnpm build</Code> before you publish.
        </p>
      </Example>

      <Example
        title="Transparent layer"
        description="The chip paints no surface of its own, so only the ring stays."
      >
        <p>
          Pass <Code $layer="transparent">$layer</Code> to keep only the ring.
        </p>
      </Example>

      <Example
        title="No layer"
        description="Without a layer of its own, the chip draws its ring in the edge color of the surface around it."
      >
        <p>
          Set <Code $layer={false}>aria-expanded</Code> on the button.
        </p>
      </Example>

      <Example
        title="Stronger ring"
        description="A named edge weight replaces the faint default ring."
      >
        <p>
          A chip with a <Code $edgeWeight="bold">bold</Code> ring.
        </p>
      </Example>

      <Example
        title="Raw brand edge"
        description="The ring uses the brand color exactly as given, at full strength, in both schemes."
      >
        <p>
          Import it from{" "}
          <Code $edge="brand" $edgeRaw>
            @ariakit/ui
          </Code>
          .
        </p>
      </Example>

      <Example
        title="Long content"
        description="A long token breaks where it would overflow a narrow column, and each line keeps its padding, radius and ring."
      >
        <p className="max-w-64">
          The import path{" "}
          <Code>@ariakit/ui/components/disclosure.ariakit.react</Code> wraps
          onto the next line.
        </p>
      </Example>
    </ExampleGrid>
  );
}

export default createGalleryPage("code", CodeExamples);
