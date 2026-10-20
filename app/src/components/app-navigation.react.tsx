/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { DisclosureGroup } from "@ariakit/ui/components/disclosure.ariakit.react";
import {
  Nav,
  NavDisclosure,
  NavLink,
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { clsx } from "clsx";
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
   * Prefixes the ids that link labels and descriptions to their links. Each
   * navigation on the page needs its own prefix.
   */
  idPrefix: string;
  /**
   * Whether the navigation fills the height of its flex column container. The
   * open group then takes the space that the closed groups leave. Longer groups
   * grow the navigation, which the container scrolls.
   */
  fill?: boolean;
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
  idPrefix,
  fill,
}: AppNavigationProps) {
  const currentGroup = groups.find((group) =>
    group.links.some((link) => link.current),
  );
  const [openLabel, setOpenLabel] = useState(
    currentGroup?.label ?? groups[0]?.label,
  );
  const hasLinks = !!links?.length;
  return (
    <Nav
      list={false}
      // The surrounding sidebar is already the navigation landmark.
      render={<div />}
      // The island wrapper of a hydrated navigation keeps the sidebar body from
      // covering it, so it covers the body itself.
      $cover
      // Link states recolor the links, so thumbnails take their surface from
      // the navigation itself.
      className={clsx(
        "[--app-navigation-surface:var(--ak-layer)]",
        // Rows in the groups sit this far from the group edges, with their text
        // aligned to the disclosure labels.
        "[--app-navigation-group-padding:--spacing(4)]",
        "[--app-navigation-inset:calc(var(--app-navigation-group-padding)-var(--nav-py))]",
        // A centered bar sits in the gap before the current row, which is the
        // inset when the row is in a group.
        "[&:has(.nav-disclosure_[aria-current])]:[--glider-padding:var(--app-navigation-inset)]",
        // The last row holds the disclosures and takes the remaining height.
        // Longer content grows the navigation, so the sidebar scrolls it with
        // the glider.
        fill && [
          "flex-1",
          hasLinks
            ? "grid-rows-[auto_minmax(0,1fr)]"
            : "grid-rows-[minmax(0,1fr)]",
        ],
      )}
      glider={{
        $kind: "bar",
        $animated: false,
        $barOffset: "center",
      }}
    >
      {hasLinks && (
        <NavList>
          {links.map((link, linkIndex) => (
            <AppNavigationLink
              key={link.href}
              link={link}
              id={`${idPrefix}-link-${linkIndex}`}
            />
          ))}
        </NavList>
      )}
      {groups.length > 0 && (
        <DisclosureGroup
          $cover
          // Without links above, the group starts the navigation, although the
          // glider precedes it in the DOM.
          $frameStart={!hasLinks}
          $p="var(--app-navigation-group-padding)"
          className={clsx(
            // Covering frames take the shell radius, which the shell paints
            // square at the sidebar edges too.
            "flex flex-col rounded-none!",
            // A filling group meets the header and the footer, whose edges
            // are its own. While every content is hidden, the group no longer
            // reaches the footer, so the last disclosure draws the bottom edge
            // right below itself.
            fill && [
              "border-y-0 *:last:border-(--ak-edge)",
              "[&:not(:has(>*>:not(.disclosure-button,[hidden])))>:last-child]:border-b",
            ],
          )}
        >
          {groups.map((group, groupIndex) => (
            <NavDisclosure
              key={group.label}
              // Group members must be direct children of the group frame.
              render={<div />}
              open={group.label === openLabel}
              setOpen={(open) => setOpenLabel(open ? group.label : undefined)}
              $split
              $bodyOffset="var(--app-navigation-inset)"
              button={{ children: group.label, indicator: "chevron-down-end" }}
              content={{
                guide: false,
                className: clsx(
                  fill && [
                    "grow",
                    // A percentage basis or a fixed content minimum would count
                    // the full content height in the size of a closing
                    // disclosure, which then jumps to its button at the end of
                    // the transition. The minimum animates with the height
                    // instead, and keeps longer content from shrinking.
                    "basis-0 min-h-0 ui-disclosure-open:min-h-max",
                    "transition-[content-visibility,height,max-height,min-height]!",
                    // Hidden content has no height to animate from, so it
                    // starts from zero, as the recipe does for its maximum.
                    "[html:focus-within_&]:starting:min-h-0",
                    // Open content grows past its own height to fill the
                    // disclosure, and still animates from a closed zero height.
                    "ui-disclosure-open:max-h-full!",
                  ],
                ),
                body: {
                  $layer: true,
                  $darken: 0.25,
                  // Rows take their radius from the body, which stays square
                  // against the group edges.
                  $rounded: "xl",
                  className: clsx(
                    "min-h-full rounded-none!",
                    "pe-(--app-navigation-inset) pb-(--app-navigation-inset)",
                  ),
                },
              }}
              className={clsx(
                "rounded-none!",
                // The open group grows into the space that the closed groups
                // leave. The root disables its own transitions, so the growth
                // transition must take precedence.
                fill && [
                  "flex flex-col data-open:grow",
                  "transition-[flex-grow]!",
                ],
              )}
            >
              <NavList>
                {group.links.map((link, linkIndex) => (
                  <AppNavigationLink
                    key={link.href}
                    link={link}
                    id={`${idPrefix}-${groupIndex}-${linkIndex}`}
                  />
                ))}
              </NavList>
            </NavDisclosure>
          ))}
        </DisclosureGroup>
      )}
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
        <NavSlot $size="xl" $rowSpan={2} $mx="md" $square={false}>
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
