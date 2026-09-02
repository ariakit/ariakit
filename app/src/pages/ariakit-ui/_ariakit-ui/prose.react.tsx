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
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react.tsx";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import { Link } from "@ariakit/ui/components/link.ariakit.react.tsx";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react.tsx";
import type { ProseProps } from "@ariakit/ui/components/prose.ariakit.react.tsx";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react.tsx";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react.tsx";
import { Sample, Samples } from "./gallery.react.tsx";

function Article(props: ProseProps) {
  return (
    <Prose {...props}>
      <HeadingLevel level={2}>
        <Heading>Styling Ariakit</Heading>
        <p>
          Ariakit components are <strong>unstyled by default</strong>. The
          styling layer composes reusable recipes with local utility overrides,
          so a <Code>Button</Code> and a <Code>Tab</Code> share one set of
          controls.
        </p>
        <p>
          Read the <Link href="#prose">styling guide</Link> for the details, or
          press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search the reference.
        </p>
        <HeadingLevel>
          <Heading>What a list looks like inside</Heading>
        </HeadingLevel>
        <List>
          <ListItem>The list reads the prose rhythm for its gap.</ListItem>
          <ListItem>
            Rows that wrap keep their text clear of the marker column.
          </ListItem>
        </List>
        <Separator />
        <p>
          Prose resumes after the rule at the same rhythm, and the rule takes
          half of it on each side.
        </p>
      </HeadingLevel>
    </Prose>
  );
}

export function ProseSection() {
  return (
    <Samples columns="wide">
      <Sample
        title="Default rhythm"
        code="Prose with headings, paragraphs, strong, Link, Code, Kbd, List and Separator"
        description="The plain markup an author writes inline, next to the components that have a style of their own."
      >
        <Article />
      </Sample>

      <Sample
        title="Gap"
        code="$gap={3} · $gap={8}"
        description="The vertical rhythm every child shares. Numbers scale the spacing token."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Article $gap={3} />
          <Article $gap={8} />
        </div>
      </Sample>

      <Sample
        title="On layers"
        code="Prose inside Layer"
        description="Paragraphs re-derive their ink from the layer they sit on, so the same article reads on an offset, inverted or brand surface."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Layer $lightnessOffset={2} className="rounded-2xl p-5">
            <Article />
          </Layer>
          <Layer $invert className="rounded-2xl p-5">
            <Article />
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
