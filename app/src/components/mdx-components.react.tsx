/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { heading } from "@ariakit/ui/styles/heading";
import { link } from "@ariakit/ui/styles/link";
import type { ComponentProps } from "react";

// MDX renders plain elements. These map them to Ariakit UI recipes so page
// content matches the site shell. Headings clear the sticky header when a
// fragment link scrolls to them.
const headingClass = "mt-6 scroll-mt-24";

function H2(props: ComponentProps<"h2">) {
  return <h2 {...heading.jsx({ className: headingClass })} {...props} />;
}

function H3(props: ComponentProps<"h3">) {
  return <h3 {...heading.jsx({ className: headingClass })} {...props} />;
}

function H4(props: ComponentProps<"h4">) {
  return <h4 {...heading.jsx({ className: headingClass })} {...props} />;
}

function A(props: ComponentProps<"a">) {
  return <a {...link.jsx()} {...props} />;
}

export const mdxComponents = { h2: H2, h3: H3, h4: H4, a: A };
