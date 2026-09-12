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
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

// The short column each box that changes one Prose setting reuses, so the
// setting is the only difference between those boxes.
function renderColumn(title: string) {
  return (
    <>
      <Heading>{title}</Heading>
      <p>
        Ariakit components come without any styles of their own, and{" "}
        <strong>every recipe is a plain source file</strong> that an app copies.
      </p>
      <p>
        Recipes such as <Code>button</Code> share one set of variants. Press{" "}
        <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search the reference.
      </p>
    </>
  );
}

export default function ProseExamples() {
  return (
    <ExampleGrid>
      {/*
        The full article is composition only. The Heading page owns the heading
        flow margins, and the List and Separator pages own how those components
        read the column gap, so no test asserts them here.
      */}
      <Example
        title="Default"
        description="An article on the default rhythm: paragraphs with strong text, inline Code, Link and Kbd, a sub-heading, a list and a rule."
        stretch
        code={`
          <Prose>
            <Heading>Styling Ariakit</Heading>
            Ariakit components are
            unstyled by default
            …
            <Code>Button</Code>
            and a
            <Code>Tab</Code>
            …
            Read the
            <Link>styling guide</Link>
            …
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            to search the reference.
            <HeadingLevel>
              <Heading>…</Heading>
            </HeadingLevel>
            <List>
              <ListItem>…</ListItem>
              <ListItem>…</ListItem>
            </List>
            <Separator />
            …
          </Prose>
        `}
      >
        <Prose>
          <Heading>Styling Ariakit</Heading>
          <p>
            Ariakit components are <strong>unstyled by default</strong>. The
            styling layer composes reusable recipes with local utility
            overrides, so a <Code>Button</Code> and a <Code>Tab</Code> share one
            set of controls.
          </p>
          <p>
            Read the <Link href="#prose">styling guide</Link> for the details,
            or press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search the reference.
          </p>
          <HeadingLevel>
            <Heading>What a list looks like inside</Heading>
          </HeadingLevel>
          <List>
            <ListItem>The list follows the rhythm of the column.</ListItem>
            <ListItem>
              Rows that wrap keep their text clear of the marker column.
            </ListItem>
          </List>
          <Separator />
          <p>The article continues after the rule on the same rhythm.</p>
        </Prose>
      </Example>

      <Example
        title="Compact gap"
        description="A smaller gap tightens the rhythm between all children. The heading margins come from the heading size, so they do not change."
        stretch
        code={`
          <Prose $gap={3}>
            <Heading>A tighter rhythm</Heading>
            …
            …
            that an app copies.
            Recipes such as
            <Code>button</Code>
            …
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            to search the reference.
          </Prose>
        `}
      >
        <Prose $gap={3}>{renderColumn("A tighter rhythm")}</Prose>
      </Example>

      <Example
        title="Small type"
        description="A text-sm/relaxed class makes the whole column smaller. The rhythm, the heading and the inline chips use em, so they scale too."
        stretch
        code={`
          <Prose>
            <Heading>Smaller text</Heading>
            …
            …
            that an app copies.
            Recipes such as
            <Code>button</Code>
            …
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            to search the reference.
          </Prose>
        `}
      >
        <Prose className="text-sm/relaxed">
          {renderColumn("Smaller text")}
        </Prose>
      </Example>

      <Example
        title="Large type"
        description="A text-2xl/relaxed class makes the whole column larger. Put the leading in the class, because a bare text-* class sets its own."
        stretch
        code={`
          <Prose>
            <Heading>Larger text</Heading>
            …
            …
            that an app copies.
            Recipes such as
            <Code>button</Code>
            …
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            to search the reference.
          </Prose>
        `}
      >
        <Prose className="text-2xl/relaxed">
          {renderColumn("Larger text")}
        </Prose>
      </Example>

      <Example
        title="Callout on an inverted layer"
        description="A surface inside the column. Its paragraph and list items keep the muted body tone. Strong text and the link adapt to the surface."
        stretch
        code={`
          <Prose>
            …
            <Frame $invert $rounded="xl" $p={4}>
              …
              Strong text
              and a
              <Link>link</Link>
              adapt to it.
              <List>
                <ListItem>…</ListItem>
                <ListItem>…</ListItem>
              </List>
            </Frame>
            …
          </Prose>
        `}
      >
        <Prose>
          <p>The column continues above the callout with body text.</p>
          <Frame $invert $rounded="xl" $p={4} className="grid gap-3">
            <p>
              A callout is a surface of its own. <strong>Strong text</strong>{" "}
              and a <Link href="#prose">link</Link> adapt to it.
            </p>
            <List>
              <ListItem>
                List items take the same tone as the paragraph.
              </ListItem>
              <ListItem>So does every row that wraps onto a new line.</ListItem>
            </List>
          </Frame>
          <p>The column continues below the callout on the same rhythm.</p>
        </Prose>
      </Example>
    </ExampleGrid>
  );
}
