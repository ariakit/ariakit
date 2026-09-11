/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonContent,
  ButtonDescription,
  ButtonLabel,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { useId } from "react";
import { screenshotFocus } from "../example.react.tsx";
import type { GalleryGroup, GalleryPageEntry } from "../pages.ts";
import {
  galleryGroups,
  getGalleryGroupPages,
  getGalleryHref,
  showcasePages,
} from "../pages.ts";

interface GroupCardProps {
  group: GalleryGroup;
  pages: readonly GalleryPageEntry[];
  /** Marks the first link as the page's single screenshot focus target. */
  focusFirstLink?: boolean;
}

function GroupCard({ group, pages, focusFirstLink }: GroupCardProps) {
  const titleId = useId();
  return (
    <Frame
      render={<article aria-labelledby={titleId} />}
      $rounded="2xl"
      $p={5}
      $border
      className="grid gap-4"
    >
      <header className="flex flex-wrap items-baseline gap-3">
        <Heading id={titleId} className="mt-0 mb-0">
          {group.title}
        </Heading>
        <Badge>
          <BadgeLabel>{pages.length} components</BadgeLabel>
        </Badge>
      </header>
      <ul className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))]">
        {pages.map((page, index) => (
          <li key={page.id} className="grid">
            <Button
              render={<a href={getGalleryHref(page.id)} />}
              $rounded="xl"
              $p={3}
              $gap="none"
              $lightnessOffset={false}
              className="justify-start text-start font-normal text-wrap"
              {...(focusFirstLink && index === 0 ? screenshotFocus : undefined)}
            >
              <ButtonContent>
                <ButtonLabel $truncate={false} className="font-semibold">
                  {page.title}
                </ButtonLabel>
                <ButtonDescription $truncate={false} $lineClamp={2}>
                  {page.description}
                </ButtonDescription>
              </ButtonContent>
            </Button>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/**
 * The gallery index. The regression fixture routes are left out on purpose:
 * they are test targets rather than something to browse, and the sidebar keeps
 * them in a collapsed group.
 */
export function OverviewExamples() {
  const groups = galleryGroups.filter((group) => group.id !== "fixtures");
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        <Badge $size="sm">
          <BadgeLabel>{showcasePages.length} components</BadgeLabel>
        </Badge>
        <Badge $size="sm">
          <BadgeLabel>{groups.length} groups</BadgeLabel>
        </Badge>
        <Badge $size="sm">
          <BadgeLabel>One React app with hash routes</BadgeLabel>
        </Badge>
      </div>
      {groups.map((group, index) => (
        <GroupCard
          key={group.id}
          group={group}
          pages={getGalleryGroupPages(group.id)}
          focusFirstLink={index === 0}
        />
      ))}
    </div>
  );
}

export default OverviewExamples;
