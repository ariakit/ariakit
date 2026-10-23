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
  NavDisclosure,
  NavDisclosureGroup,
  NavLink,
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { useState } from "react";
import { AppThumbnail } from "#app/components/app-thumbnail.react.tsx";
import type { AppLink, AppNavigationGroup } from "#app/lib/app.ts";

export interface AppNavigationProps {
  groups: AppNavigationGroup[];
  /**
   * Links listed before the groups, such as the site sections.
   */
  links?: AppLink[];
  /**
   * Whether the navigation fills the height of its flex column container. The
   * open group then takes the space that the closed groups leave, and scrolls
   * its links when they need more space.
   */
  fill?: boolean;
  /**
   * The view transition name of the current link's bar. A bar that moves across
   * page loads needs the same name on both pages.
   */
  barTransitionName?: string;
}

/**
 * The site's navigation links, with each group in a disclosure. Only one group
 * opens at a time, starting with the group of the current page. Render it
 * inside a labelled navigation landmark, such as a `ShellSidebar` rendered as
 * `nav`.
 */
export function AppNavigation({
  groups,
  links,
  fill,
  barTransitionName,
}: AppNavigationProps) {
  const currentGroup = groups.find((group) =>
    group.links.some((link) => link.current),
  );
  const [openLabel, setOpenLabel] = useState(
    currentGroup?.label ?? groups[0]?.label,
  );
  return (
    <Nav
      list={false}
      // The surrounding sidebar is already the navigation landmark.
      render={<div />}
      // Span the sidebar body padding, so bars meet the sidebar edge.
      $cover
      $fill={fill}
      // Link states recolor the links, so thumbnails take their surface from
      // the navigation itself.
      className="[--app-navigation-surface:var(--ak-layer)]"
      bar={{ $offset: "halfway" }}
      $barTransitionName={barTransitionName}
    >
      {!!links?.length && (
        <NavList>
          {links.map((link) => (
            <AppNavigationLink key={link.href} link={link} />
          ))}
        </NavList>
      )}
      {groups.length > 0 && (
        <NavDisclosureGroup $fill={fill}>
          {groups.map((group) => (
            <NavDisclosure
              key={group.label}
              open={group.label === openLabel}
              setOpen={(open) => setOpenLabel(open ? group.label : undefined)}
              $split
              button={{ children: group.label, indicator: "chevron-down-end" }}
              content={{
                guide: false,
                body: { $layer: true, $darken: 0.25 },
              }}
            >
              <NavList>
                {group.links.map((link) => (
                  <AppNavigationLink key={link.href} link={link} />
                ))}
              </NavList>
            </NavDisclosure>
          ))}
        </NavDisclosureGroup>
      )}
    </Nav>
  );
}

interface AppNavigationLinkProps {
  link: AppLink;
}

function AppNavigationLink({ link }: AppNavigationLinkProps) {
  const current = link.current ? "page" : undefined;
  if (!link.thumbnail && !link.description) {
    return (
      <NavLink href={link.href} aria-current={current}>
        {link.label}
      </NavLink>
    );
  }
  return (
    <NavLink
      href={link.href}
      aria-current={current}
      className="group/thumbnail"
    >
      {link.thumbnail && (
        // The thumbnail draws its own border, which its scenes share.
        <NavSlot $kind="thumbnail" $rowSpan={2} $border={false}>
          <AppThumbnail
            html={link.thumbnail}
            size="slot"
            surface="var(--app-navigation-surface)"
          />
        </NavSlot>
      )}
      <NavLinkContent>
        <NavLinkLabel $truncate>{link.label}</NavLinkLabel>
        {link.description && (
          <NavLinkDescription>{link.description}</NavLinkDescription>
        )}
      </NavLinkContent>
    </NavLink>
  );
}
