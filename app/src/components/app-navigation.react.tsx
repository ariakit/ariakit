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
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { AppThumbnail } from "#app/components/app-thumbnail.react.tsx";
import type { AppLink, AppNavigationGroup } from "#app/lib/app.ts";

export interface AppNavigationProps {
  groups: AppNavigationGroup[];
  /**
   * Prefixes the ids that link labels and descriptions to their links. Each
   * navigation on the page needs its own prefix.
   */
  idPrefix: string;
}

/**
 * The site's grouped navigation links. Render it inside a labelled navigation
 * landmark, such as a `ShellSidebar` rendered as `nav`.
 */
export function AppNavigation({ groups, idPrefix }: AppNavigationProps) {
  return (
    <Nav
      list={false}
      // The surrounding sidebar is already the navigation landmark.
      render={<div />}
      // Link states recolor the links, so thumbnails take their surface from
      // the navigation itself.
      className="[--app-navigation-surface:var(--ak-layer)]"
      glider={{
        $kind: "bar",
        $animated: false,
        $barOffset: "center",
      }}
    >
      {groups.map((group, groupIndex) => (
        <NavGroup key={group.label}>
          <NavGroupLabel>{group.label}</NavGroupLabel>
          <NavList>
            {group.links.map((link, linkIndex) => (
              <AppNavigationLink
                key={link.href}
                link={link}
                id={`${idPrefix}-${groupIndex}-${linkIndex}`}
              />
            ))}
          </NavList>
        </NavGroup>
      ))}
    </Nav>
  );
}

interface AppNavigationLinkProps {
  link: AppLink;
  id: string;
}

function AppNavigationLink({ link, id }: AppNavigationLinkProps) {
  const current = link.current ? "page" : undefined;
  if (!link.thumbnail && !link.description) {
    return (
      <NavLink href={link.href} aria-current={current}>
        {link.label}
      </NavLink>
    );
  }
  const labelId = `${id}-label`;
  const descriptionId = link.description ? `${id}-description` : undefined;
  return (
    // The ids keep the description out of the link's name.
    <NavLink
      href={link.href}
      aria-current={current}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      className="group/thumbnail"
    >
      {link.thumbnail && (
        <NavSlot $size="2xl" $rowSpan={2} $mx="md" $square={false}>
          <AppThumbnail
            html={link.thumbnail}
            size="slot"
            surface="var(--app-navigation-surface)"
            className="h-full"
          />
        </NavSlot>
      )}
      <NavLinkContent>
        {/* The title keeps the ink and weight of a selected link, so it stands
            out from the description. Classes set both because the link's idle
            dark ink class outranks its $ink variant and no variant sets the
            label weight. */}
        <NavLinkLabel
          id={labelId}
          $truncate
          className="ak-ink-100 font-[calc(500+var(--contrast))]"
        >
          {link.label}
        </NavLinkLabel>
        {link.description && (
          <NavLinkDescription id={descriptionId}>
            {link.description}
          </NavLinkDescription>
        )}
      </NavLinkContent>
    </NavLink>
  );
}
