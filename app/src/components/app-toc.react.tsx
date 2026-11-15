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
import type { AppHeading, AppTocData } from "#app/lib/app.ts";
import { APP_TOC_DATA_ID, APP_TOP_ID, isAppTocData } from "#app/lib/app.ts";
import { usePageData } from "#app/lib/use-page.react.ts";

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
        <TocList $marker="bullet">
          <Entries entries={entry.children} />
        </TocList>
      </TocItem>
    );
  });
}

export interface AppTocProps extends AppTocData {}

/**
 * The table of contents of a site page. Render it inside a navigation landmark
 * named "On this page", such as a `ShellSidebar` rendered as `nav`. The
 * landmark renders outside this island, so the table of contents skips its own.
 * It stays across pages, where it lists the headings in the page element with
 * the id `APP_TOC_DATA_ID`, so its bar glides to the sections of the next page.
 */
export function AppToc(props: AppTocProps) {
  const { title, headings } =
    usePageData(APP_TOC_DATA_ID, isAppTocData) ?? props;
  return (
    <Toc landmark={false} label={<TocLabel>On this page</TocLabel>} $cover>
      {title && <TocLink href={`#${APP_TOP_ID}`}>{title}</TocLink>}
      <Entries entries={getEntries(headings)} />
    </Toc>
  );
}
