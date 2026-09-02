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
  Badge,
  BadgeLabel,
} from "@ariakit/ui/components/badge.ariakit.react.tsx";
import { ButtonSlot } from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import {
  Nav,
  NavButton,
  NavButtonContent,
  NavDisclosure,
  NavDisclosureButton,
  NavGroup,
  NavGroupLabel,
  NavIcon,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react.tsx";
import * as icons from "lucide-react";
import { Caption, Sample, Samples } from "./gallery.react.tsx";

const guides = [
  { label: "Getting started", icon: icons.Rocket },
  { label: "Styling", icon: icons.Palette },
  { label: "Composition", icon: icons.Blocks },
  { label: "Accessibility", icon: icons.Accessibility },
];

function Rows() {
  return (
    <Nav>
      <li>
        <NavLink href="#nav">Overview</NavLink>
      </li>
      <li>
        <NavLink href="#nav" aria-current="page">
          Current row
        </NavLink>
      </li>
      <li>
        <NavLink href="#nav">Another row</NavLink>
      </li>
      <li>
        <NavLink href="#nav" aria-disabled="true">
          Disabled row
        </NavLink>
      </li>
    </Nav>
  );
}

export function NavSection() {
  return (
    <Samples>
      <Sample
        title="Rows and states"
        code='Nav > NavLink aria-current="page" · aria-disabled'
        description="Rows read as plain text until they are current, when they lift on an inset ring. Hover the others to see the pill."
      >
        <Rows />
      </Sample>

      <Sample
        title="Icons and groups"
        code="Nav $iconSize · NavGroup > NavGroupLabel + NavList > NavLink > NavIcon"
        description="The icon slot keeps the line height so a wrapping label stays aligned to it. Groups label a run of rows."
      >
        <Nav $iconSize={5}>
          <NavGroup>
            <NavGroupLabel className="ak-ink-60 px-2 py-1 text-sm font-medium">
              Guides
            </NavGroupLabel>
            <NavList>
              {guides.map((guide) => (
                <li key={guide.label}>
                  <NavLink href="#nav">
                    <NavIcon>
                      <guide.icon strokeWidth={1.5} />
                    </NavIcon>
                    {guide.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink href="#nav" aria-current="page">
                  <NavIcon>
                    <icons.BookOpen strokeWidth={1.5} />
                  </NavIcon>
                  A label long enough to wrap onto a second line, so the icon
                  column stays put
                </NavLink>
              </li>
            </NavList>
          </NavGroup>
          <NavGroup>
            <NavGroupLabel className="ak-ink-60 px-2 py-1 text-sm font-medium">
              Reference
            </NavGroupLabel>
            <NavList>
              <li>
                <NavLink href="#nav">
                  <NavIcon>
                    <icons.FileCode strokeWidth={1.5} />
                  </NavIcon>
                  Components
                  <ButtonSlot $kind="badge" $layer="brand" className="ms-auto">
                    12
                  </ButtonSlot>
                </NavLink>
              </li>
              <li>
                <NavLink href="#nav">
                  <NavIcon>
                    <icons.Braces strokeWidth={1.5} />
                  </NavIcon>
                  Hooks
                </NavLink>
              </li>
            </NavList>
          </NavGroup>
        </Nav>
      </Sample>

      <Sample
        title="Gap"
        code="Nav $gap={0} · $gap={3}"
        description="At zero the pills touch and fill the row. A wider gap grows the hit areas and insets the pill by half of it."
      >
        <div className="grid gap-4">
          <Nav $gap={0}>
            <li>
              <NavLink href="#nav">Rows touch at gap 0</NavLink>
            </li>
            <li>
              <NavLink href="#nav" aria-current="page">
                The pill fills the row
              </NavLink>
            </li>
            <li>
              <NavLink href="#nav">Another row</NavLink>
            </li>
          </Nav>
          <Nav $gap={3}>
            <li>
              <NavLink href="#nav">A wider gap grows hit areas</NavLink>
            </li>
            <li>
              <NavLink href="#nav" aria-current="page">
                and insets the pill by half of it
              </NavLink>
            </li>
          </Nav>
        </div>
      </Sample>

      <Sample
        title="Disclosures"
        code="NavDisclosure button={<NavDisclosureButton icon />} > NavList"
        description="A collapsible run of rows with a guide line under its icon. A current link opens the group around it."
      >
        <Nav $iconSize={5}>
          {guides.map((guide, index) => (
            <NavDisclosure
              key={guide.label}
              defaultOpen={index === 0}
              button={
                <NavDisclosureButton icon={<guide.icon strokeWidth={1.5} />}>
                  {guide.label}
                </NavDisclosureButton>
              }
            >
              <NavList>
                <li>
                  <NavLink
                    href="#nav"
                    currentUrl={index === 1 ? "#nav" : undefined}
                  >
                    Introduction
                  </NavLink>
                </li>
                <li>
                  <NavLink href="#tabs">Installation</NavLink>
                </li>
                <li>
                  <NavLink href="#tabs">Quickstart</NavLink>
                </li>
              </NavList>
            </NavDisclosure>
          ))}
        </Nav>
      </Sample>

      <Sample
        title="Current from a URL"
        code='NavLink currentUrl="/docs/button" href="/docs/button"'
        description="The link compares its href with the page URL, ignoring trailing slashes and matching the hash only when the href declares one."
      >
        <Nav>
          {["/docs/button", "/docs/tabs", "/docs/dialog"].map((href) => (
            <li key={href}>
              <NavLink
                href={href}
                currentUrl="/docs/button/"
                onClick={(event) => event.preventDefault()}
              >
                {href}
              </NavLink>
            </li>
          ))}
        </Nav>
      </Sample>

      <Sample
        title="Nav button"
        code="NavButton > NavIcon + NavButtonContent · render={<a />}"
        description="A row that is not a disclosure, such as a sidebar brand row, sized like the disclosure rows around it."
      >
        <Nav $iconSize={5}>
          <li>
            <NavButton render={<a href="#nav" />}>
              <NavIcon>
                <icons.Hexagon strokeWidth={1.5} />
              </NavIcon>
              <NavButtonContent>Ariakit UI</NavButtonContent>
              <Badge $layer="brand" className="ms-auto">
                <BadgeLabel>beta</BadgeLabel>
              </Badge>
            </NavButton>
          </li>
          <li>
            <NavButton>
              <NavIcon>
                <icons.Search strokeWidth={1.5} />
              </NavIcon>
              <NavButtonContent>Search</NavButtonContent>
              <ButtonSlot $kind="shortcut" className="ms-auto">
                ⌘K
              </ButtonSlot>
            </NavButton>
          </li>
        </Nav>
      </Sample>

      <Sample
        title="On layers"
        code="Nav inside Layer"
        description="The pills and the current ring read the surface around them."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Layer $invert className="grid gap-2 rounded-xl p-3">
            <Caption>Inverted</Caption>
            <Rows />
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-3">
            <Caption>Brand</Caption>
            <Rows />
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
