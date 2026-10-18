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
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import type { AppNavigationGroup } from "#app/lib/app.ts";

export interface AppNavigationProps {
  groups: AppNavigationGroup[];
}

/**
 * The site's grouped navigation links. Render it inside a labelled navigation
 * landmark, such as a `ShellSidebar` rendered as `nav`.
 */
export function AppNavigation({ groups }: AppNavigationProps) {
  return (
    <Nav
      list={false}
      // The surrounding sidebar is already the navigation landmark.
      render={<div />}
      glider={{ $kind: "bar", $animated: false }}
    >
      {groups.map((group) => (
        <NavGroup key={group.label}>
          <NavGroupLabel>{group.label}</NavGroupLabel>
          <NavList>
            {group.links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                aria-current={link.current ? "page" : undefined}
              >
                {link.label}
              </NavLink>
            ))}
          </NavList>
        </NavGroup>
      ))}
    </Nav>
  );
}
