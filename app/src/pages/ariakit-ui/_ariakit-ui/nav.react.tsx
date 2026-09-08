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
import {
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import type { NavProps } from "@ariakit/ui/components/nav.ariakit.react.tsx";
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
import * as React from "react";
import { Caption, Labeled, Sample, Samples, Stage } from "./gallery.react.tsx";

const guides = [
  { label: "Getting started", icon: icons.Rocket },
  { label: "Styling", icon: icons.Palette },
  { label: "Composition", icon: icons.Blocks },
  { label: "Accessibility", icon: icons.Accessibility },
];

// The same guides in Arabic, for the right-to-left sample.
const guidesRtl = [
  { label: "البدء", icon: icons.Rocket },
  { label: "التنسيق", icon: icons.Palette },
  { label: "التركيب", icon: icons.Blocks },
  { label: "إمكانية الوصول", icon: icons.Accessibility },
];

const pages = ["Overview", "Installation", "Usage", "Changelog"];

/**
 * A nav whose current row moves on click, so a glider's travel can be watched
 * rather than inferred from a frozen state.
 */
function DemoNav(props: NavProps) {
  const [current, setCurrent] = React.useState(1);
  return (
    <Nav {...props}>
      {pages.map((page, index) => (
        <li key={page}>
          <NavLink
            href="#nav"
            aria-current={current === index ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setCurrent(index);
            }}
          >
            {page}
          </NavLink>
        </li>
      ))}
    </Nav>
  );
}

/**
 * Two open disclosures whose current link moves on click, for the bar samples.
 */
function DemoDisclosures(props: NavProps) {
  const [current, setCurrent] = React.useState("Styling/Introduction");
  return (
    <Nav $iconSize={5} {...props}>
      {guides.slice(0, 2).map((guide) => (
        <NavDisclosure
          key={guide.label}
          defaultOpen
          button={
            <NavDisclosureButton icon={<guide.icon strokeWidth={1.5} />}>
              {guide.label}
            </NavDisclosureButton>
          }
        >
          <NavList>
            {["Introduction", "Installation", "Quickstart"].map((page) => {
              const id = `${guide.label}/${page}`;
              return (
                <li key={page}>
                  <NavLink
                    href="#nav"
                    aria-current={current === id ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrent(id);
                    }}
                  >
                    {page}
                  </NavLink>
                </li>
              );
            })}
          </NavList>
        </NavDisclosure>
      ))}
    </Nav>
  );
}

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
        code="Nav list={false} $iconSize · NavGroup > NavGroupLabel + NavList > NavLink > NavIcon"
        description="The icon slot keeps the line height so a wrapping label stays aligned to it. Groups label a run of rows: the label pads like a row and its text starts where the rows' content does."
      >
        <Nav list={false} $iconSize={5}>
          <NavGroup>
            <NavGroupLabel>Guides</NavGroupLabel>
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
            <NavGroupLabel>Reference</NavGroupLabel>
            <NavList>
              <li>
                <NavLink href="#nav">
                  <NavIcon>
                    <icons.FileCode strokeWidth={1.5} />
                  </NavIcon>
                  <ButtonLabel>Components</ButtonLabel>
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
        title="Gliders"
        code='Nav glider · glider={[{ $state: "hover" }, { $state: "selected" }, { $state: "focus" }]} · glider={{ $kind: "bevel" }}'
        description="With a glider the current row paints nothing itself and the glider travels to it. Click a row to move it. The second nav adds a hover cover under the current one, which follows the pointer, and a focus ring that follows the keyboard: tab through its rows. The last one runs the hover cover across disclosure buttons and links alike, and the current cover from one group to the other."
      >
        <Stage direction="column">
          <Labeled label="Selected cover">
            <DemoNav glider />
          </Labeled>
          <Labeled label="Selected, hover and focus">
            <DemoNav
              glider={[
                { $state: "hover" },
                { $state: "selected" },
                { $state: "focus" },
              ]}
            />
          </Labeled>
          <Labeled label="Bevel">
            <DemoNav glider={{ $kind: "bevel" }} />
          </Labeled>
          <Labeled label="Hover and current covers across disclosures">
            <DemoDisclosures glider={[{ $state: "hover" }, {}]} />
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="Active bar"
        code='Nav glider={{ $kind: "bar" }} · $side="end" · $layer="brand" · glider={[{ $kind: "bar" }, {}]}'
        description="A bar marks the current row beside its own surface. At the start it lands on the guide line of the disclosure around the row, or on the row's start edge without one, and it travels from one group to the other. Click a link to move it. The second nav pairs the bar with a cover, which takes the row's surface over."
      >
        <Stage direction="column">
          <Labeled label="On the guide line">
            <DemoDisclosures glider={{ $kind: "bar" }} />
          </Labeled>
          <Labeled label="Bar and cover">
            <DemoDisclosures glider={[{ $kind: "bar", $layer: "brand" }, {}]} />
          </Labeled>
          <Labeled label="At the end, in the brand color">
            <DemoDisclosures
              glider={{ $kind: "bar", $side: "end", $layer: "brand" }}
            />
          </Labeled>
          <Labeled label="Without a guide">
            <DemoNav glider={{ $kind: "bar" }} />
          </Labeled>
        </Stage>
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
        title="Right to left"
        code='<div dir="rtl"> > Nav'
        description="Under a right-to-left direction the rows, the group labels, the guide lines, the bar and the slots mirror, the closed chevrons point the other way and a shortcut keeps its keys in order."
      >
        <div dir="rtl" lang="ar" className="grid gap-4">
          <Nav list={false} $iconSize={5}>
            <NavGroup>
              <NavGroupLabel>الأدلة</NavGroupLabel>
              <NavList>
                {guidesRtl.map((guide, index) => (
                  <li key={guide.label}>
                    <NavLink
                      href="#nav"
                      aria-current={index === 1 ? "page" : undefined}
                    >
                      <NavIcon>
                        <guide.icon strokeWidth={1.5} />
                      </NavIcon>
                      {guide.label}
                    </NavLink>
                  </li>
                ))}
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>المرجع</NavGroupLabel>
              <NavList>
                <li>
                  <NavLink href="#nav">
                    <NavIcon>
                      <icons.FileCode strokeWidth={1.5} />
                    </NavIcon>
                    <ButtonLabel>المكونات</ButtonLabel>
                    <ButtonSlot
                      $kind="badge"
                      $layer="brand"
                      className="ms-auto"
                    >
                      12
                    </ButtonSlot>
                  </NavLink>
                </li>
                <li>
                  <NavButton>
                    <NavIcon>
                      <icons.Search strokeWidth={1.5} />
                    </NavIcon>
                    <NavButtonContent>بحث</NavButtonContent>
                    <ButtonSlot $kind="shortcut" className="ms-auto">
                      ⌘K
                    </ButtonSlot>
                  </NavButton>
                </li>
              </NavList>
            </NavGroup>
          </Nav>
          <Nav $iconSize={5} glider={{ $kind: "bar" }}>
            {guidesRtl.slice(0, 2).map((guide, index) => (
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
                    <NavLink href="#nav" aria-current="page">
                      مقدمة
                    </NavLink>
                  </li>
                  <li>
                    <NavLink href="#nav">التثبيت</NavLink>
                  </li>
                  <li>
                    <NavLink href="#nav">البدء السريع</NavLink>
                  </li>
                </NavList>
              </NavDisclosure>
            ))}
          </Nav>
        </div>
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
