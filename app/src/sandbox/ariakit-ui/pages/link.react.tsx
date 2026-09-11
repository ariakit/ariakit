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
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { ArrowUpRight } from "lucide-react";
import { Example, ExampleGrid, screenshotFocus } from "../example.react.tsx";

export function LinkExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="Links in running text, with a brand tint and a thin underline. The first link shows the focus ring."
      >
        <Prose>
          <p>
            Read the{" "}
            <Link href="#styling-guide" {...screenshotFocus}>
              styling guide
            </Link>{" "}
            first, then the{" "}
            <Link href="#composition">composition patterns</Link>. Every example
            links back to its <Link href="#source">source on GitHub</Link>.
          </p>
        </Prose>
      </Example>

      <Example
        title="Wrapped across lines"
        description="The underline follows every line of a link that wraps."
      >
        <p className="max-w-64 text-sm">
          <Link href="#wrapped">
            A link long enough to wrap onto a second and a third line inside a
            narrow column
          </Link>
          .
        </p>
      </Example>

      <Example
        title="Trailing icon"
        description="An icon inside the link takes the link color and stays out of the underline."
      >
        <Link href="#external" className="inline-flex items-center gap-1">
          ariakit.com
          <ArrowUpRight className="size-[1em]" />
        </Link>
      </Example>

      <Example
        title="Rendered as a button"
        description="An in-page action keeps the look of a link."
      >
        <Link render={<button type="button" />}>Copy link</Link>
      </Example>

      <Example
        title="Danger"
        description="A named color replaces the brand tint."
      >
        <Link href="#delete-account" $text="danger">
          Delete account
        </Link>
      </Example>

      <Example
        title="Custom color"
        description="Any CSS color gets the same contrast floor as a named color."
      >
        <Link href="#release-notes" $text="#d946ef">
          Release notes
        </Link>
      </Example>

      <Example
        title="Derived from the layer"
        description="Without a color, the link takes its hue from the surface around it: gray on the canvas, a low-chroma slate on a tinted surface."
      >
        <Link href="#privacy" $text>
          Privacy policy
        </Link>
      </Example>

      <Example
        title="Inherited color"
        description="The link takes the ink of the text around it, with no contrast floor and no push on dark layers. The caller owns the contrast."
      >
        <p className="ak-ink-70 text-sm">
          By continuing you accept the{" "}
          <Link href="#terms" $text={false}>
            terms of service
          </Link>
          .
        </p>
      </Example>

      <Example
        title="Stronger contrast"
        description="A larger push moves the tint farther from the surface in both themes."
      >
        <Link href="#changelog" $textPush={30}>
          Read the changelog
        </Link>
      </Example>

      <Example
        title="Offset focus ring"
        description="A standalone link has room for a ring that sits apart from it. Press Tab to move focus to it."
      >
        {/*
          WebKit leaves links out of the Tab order unless full keyboard access
          is on, and this box exists to be tabbed into.
        */}
        <Link href="#all" tabIndex={0} $focusOffset={2}>
          View all
        </Link>
      </Example>

      <Example
        title="On a brand layer"
        description="On its own hue, the link takes a pale tint that still has enough contrast."
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="text-sm">
          A brand layer with a <Link href="#brand">link</Link> in it.
        </Frame>
      </Example>

      <Example
        title="On an inverted layer"
        description="The tint follows the surface it sits on, not the page theme: it lightens on a dark layer in light mode, and it does not in dark mode."
      >
        <Frame $invert $rounded="xl" $p={4} className="text-sm">
          An inverted layer with a <Link href="#inverted">link</Link> in it.
        </Frame>
      </Example>
    </ExampleGrid>
  );
}

export default LinkExamples;
