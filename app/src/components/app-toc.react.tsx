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
  Toc,
  TocItem,
  TocLabel,
  TocLink,
  TocList,
} from "@ariakit/ui/components/toc.ariakit.react";
import type { AppHeading } from "#app/lib/app.ts";

interface AppTocEntry extends AppHeading {
  children: AppTocEntry[];
}

// Nests each heading under the closest earlier heading of a lower depth.
function getEntries(headings: AppHeading[]) {
  const entries: AppTocEntry[] = [];
  const parents: AppTocEntry[] = [];
  for (const heading of headings) {
    const entry = { ...heading, children: [] };
    while (parents.length) {
      const parent = parents.at(-1);
      if (parent && parent.depth < heading.depth) break;
      parents.pop();
    }
    const parent = parents.at(-1);
    if (parent) {
      parent.children.push(entry);
    } else {
      entries.push(entry);
    }
    parents.push(entry);
  }
  return entries;
}

function Entries({ entries }: { entries: AppTocEntry[] }) {
  return entries.map((entry) => {
    const href = `#${entry.slug}`;
    if (!entry.children.length) {
      return (
        <TocLink key={entry.slug} href={href}>
          {entry.text}
        </TocLink>
      );
    }
    return (
      <TocItem key={entry.slug}>
        <TocLink href={href}>{entry.text}</TocLink>
        <TocList>
          <Entries entries={entry.children} />
        </TocList>
      </TocItem>
    );
  });
}

export interface AppTocProps {
  headings: AppHeading[];
}

/**
 * The table of contents of a site page. Render it inside a navigation landmark
 * named "On this page", such as a `ShellSidebar` rendered as `nav`. The
 * landmark renders outside this island, so the table of contents skips its own.
 */
export function AppToc({ headings }: AppTocProps) {
  return (
    <Toc
      landmark={false}
      label={<TocLabel $uppercase>On this page</TocLabel>}
      $cover
    >
      <Entries entries={getEntries(headings)} />
    </Toc>
  );
}
