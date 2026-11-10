/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import {
  HovercardAnchor,
  HovercardProvider,
} from "@ariakit/ui/components/hovercard.ariakit.react";
import {
  Nav,
  NavDisclosure,
  NavDisclosureGroup,
  NavLink,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { useId, useState } from "react";
import { AppNavigationCard } from "#app/components/app-navigation-card.react.tsx";
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
 * `nav`. When the mouse pointer rests on a link with `examples`, a card next to
 * it shows them. The links share the card, which slides from one link to the
 * next.
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
  const cardLinks = groups
    .flatMap((group) => group.links)
    .filter((link) => !!link.examples?.length);
  const nav = (
    <Nav
      list={false}
      // Astro renders the surrounding sidebar, which is already the navigation
      // landmark, outside this island's React tree, so it can't skip it.
      landmark={false}
      // Span the sidebar body padding, so bars meet the sidebar edge.
      $cover
      $fill={fill}
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
                body: { $darken: 0.25 },
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
  if (!cardLinks.length) {
    return nav;
  }
  return (
    // The card opens beside the sidebar, centered on the link. It shows after
    // half the default timeout of a hovercard.
    <HovercardProvider placement="right" showTimeout={250}>
      {nav}
      <AppNavigationCard links={cardLinks} />
    </HovercardProvider>
  );
}

interface AppNavigationLinkProps {
  link: AppLink;
}

function AppNavigationLink({ link }: AppNavigationLinkProps) {
  const countId = useId();
  const current = link.current ? "page" : undefined;
  // A link with examples opens the card. A scroll of the sidebar that brings
  // the link under a resting mouse pointer counts as hovering it, so the card
  // follows the pointer while the links scroll. A click on the link hides the
  // card, since the page of the link loads next.
  const anchor = link.examples?.length ? (
    <HovercardAnchor hoverOnScroll hideOnClick />
  ) : undefined;
  // The link of the card looks hovered while the pointer moves onto the card.
  // Links outside a card provider, such as in the drawer, have no store.
  const store = ak.useHovercardContext();
  const showsCard = ak.useStoreState(store, (state) => {
    if (!state?.open) return false;
    return state.anchorElement?.getAttribute("href") === link.href;
  });
  if (link.count == null) {
    return (
      <NavLink
        href={link.href}
        aria-current={current}
        render={anchor}
        $hovered={showsCard}
      >
        {link.label}
      </NavLink>
    );
  }
  return (
    <NavLink
      href={link.href}
      aria-current={current}
      aria-describedby={countId}
      render={anchor}
      $hovered={showsCard}
    >
      <NavLinkLabel>{link.label}</NavLinkLabel>
      {/* A text slot keeps the count at the end of the first line. The count
          describes the link, so it stays out of the name, which is the page
          title. A hidden element still describes the link. */}
      <NavSlot $kind="text" $ink={50} id={countId} aria-hidden>
        {link.count}
        <span className="sr-only">
          {link.count === 1 ? " example" : " examples"}
        </span>
      </NavSlot>
    </NavLink>
  );
}
