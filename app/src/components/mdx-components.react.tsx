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
import {
  Heading,
  HeadingDescription,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react";
import { cx } from "clava";
import type { ComponentProps } from "react";

// MDX renders plain elements. These map them to Ariakit UI components so page
// content matches the site shell. Headings clear the sticky header when a
// fragment link scrolls to them.
const headingClass = "mt-6 scroll-mt-24";

function H2(props: ComponentProps<"h2">) {
  return <Heading render={<h2 />} className={headingClass} {...props} />;
}

function H3(props: ComponentProps<"h3">) {
  return <Heading render={<h3 />} className={headingClass} {...props} />;
}

function H4(props: ComponentProps<"h4">) {
  return <Heading render={<h4 />} className={headingClass} {...props} />;
}

// Absolute and protocol-relative URLs leave the site. Relative paths,
// fragments, and other schemes such as mailto: stay in the current tab.
const externalHrefPattern = /^(?:https?:)?\/\//i;

function isExternalHref(href?: string) {
  if (!href) return false;
  return externalHrefPattern.test(href);
}

// External links open in a new tab without giving the destination page access
// to window.opener or the referrer. Explicit props still take precedence.
function A(props: ComponentProps<"a">) {
  if (!isExternalHref(props.href)) {
    return <Link {...props} />;
  }
  return <Link target="_blank" rel="noopener noreferrer" {...props} />;
}

function Keycap(props: ComponentProps<"kbd">) {
  return <Kbd $kind="keycap" {...props} />;
}

function Ol(props: ComponentProps<"ol">) {
  return <List ordered {...props} />;
}

// The main body clips its overflow, so a long line must wrap inside its block.
// Scrolling would need a tab stop on every block for keyboard users in Safari.
function Pre({ className, ...props }: ComponentProps<"pre">) {
  return (
    <pre
      {...props}
      className={cx("whitespace-pre-wrap wrap-anywhere", className)}
    />
  );
}

// The rehypeHtmlComponents plugin also applies these to HTML written as JSX,
// and leaves the code of a fenced block out.
const inlineComponents = { a: A, code: Code, kbd: Keycap };

export const mdxComponents = {
  ...inlineComponents,
  h2: H2,
  h3: H3,
  h4: H4,
  ul: List,
  ol: Ol,
  li: ListItem,
  hr: Separator,
  pre: Pre,
};

// A page description renders its own paragraphs, so each one is the description
// part. A wrapper part can't mute them because prose colors each paragraph.
export const descriptionComponents = {
  ...inlineComponents,
  p: HeadingDescription,
};
