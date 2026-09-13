/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as Ariakit from "@ariakit/react";
import {
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  DisclosureButtonLabel,
  DisclosureButtonSlot,
} from "@ariakit/ui/components/disclosure.ariakit.react";
import type { DisclosureButtonLabelProps } from "@ariakit/ui/components/disclosure.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import type { NavProps } from "@ariakit/ui/components/nav.ariakit.react";
import {
  Nav,
  NavButton,
  NavButtonContent,
  NavDisclosure,
  NavDisclosureButton,
  NavDisclosureContent,
  NavGroup,
  NavGroupLabel,
  NavIcon,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  Accessibility,
  Blocks,
  FileCode,
  Hexagon,
  Inbox,
  Palette,
  Rocket,
  Search,
  Settings,
  TextCursorInput,
} from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

function CustomLabel(props: DisclosureButtonLabelProps) {
  return <DisclosureButtonLabel {...props} />;
}

// Migrated from nav-optional-headings.react.tsx in the nav-interactions
// sandbox, with the same markup.
function NavOptionalHeadings() {
  const [headings, setHeadings] = useState(false);
  // A hidden heading supplies false; zero is still a navigation label.
  return (
    <section aria-label="Optional navigation headings" className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={headings}
          onChange={(event) => setHeadings(event.target.checked)}
        />
        Show navigation headings
      </label>
      <Nav aria-label="Workspace navigation">
        <NavDisclosure button={headings && "Workspace pages"}>
          <NavLink href="/workspace/members">Workspace members</NavLink>
          <NavLink href="/workspace/settings">Workspace settings</NavLink>
        </NavDisclosure>
      </Nav>
      <Nav aria-label="Invitation navigation">
        <NavDisclosure button={0}>
          <NavLink href="/invitations/settings">Invitation settings</NavLink>
        </NavDisclosure>
      </Nav>
    </section>
  );
}

// Every scenario below comes from the nav-interactions sandbox, with the same
// markup, props and initial state.

// The rows link to documentation paths that do not exist in the sandbox, so a
// click must not leave the page.
function preventNavigation(event: MouseEvent) {
  event.preventDefault();
}

const pages = ["Overview", "Installation", "Usage", "Changelog"];

/**
 * A flat nav whose current row moves on click, so a glider can be watched as it
 * travels. The initial current row is fixed.
 */
function DemoNav(props: NavProps) {
  const [current, setCurrent] = useState("Installation");
  return (
    <Nav {...props}>
      {pages.map((page) => (
        <li key={page}>
          <NavLink
            href={`#${page.toLowerCase()}`}
            aria-current={current === page ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setCurrent(page);
            }}
          >
            {page}
          </NavLink>
        </li>
      ))}
    </Nav>
  );
}

const sections = [
  { title: "Getting started", slug: "start", icon: Rocket },
  { title: "Styling", slug: "styling", icon: Palette },
];

const sectionPages = ["Introduction", "Installation", "Quickstart"];

/**
 * Two open sections whose current link moves on click, so a bar can be watched
 * as it travels from one section to the other.
 */
function DemoSections(props: NavProps) {
  const [current, setCurrent] = useState("styling/introduction");
  return (
    <Nav $iconSize={5} {...props}>
      {sections.map((section) => (
        <NavDisclosure
          key={section.slug}
          defaultOpen
          button={
            <NavDisclosureButton icon={<section.icon strokeWidth={1.5} />}>
              {section.title}
            </NavDisclosureButton>
          }
        >
          <NavList>
            {sectionPages.map((page) => {
              const id = `${section.slug}/${page.toLowerCase()}`;
              return (
                <li key={page}>
                  <NavLink
                    href={`#${id}`}
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

const INITIAL_SIDEBAR_URL = "/docs/styling/introduction";

/**
 * A documentation sidebar that keeps the current URL the way a router does: a
 * click on a link makes it the current page instead of navigating. The focus
 * glider follows the keyboard, and WebKit leaves links out of the Tab order
 * unless full keyboard access is on, so every link takes an explicit tab index.
 */
function DocumentationSidebar() {
  const [currentUrl, setCurrentUrl] = useState(INITIAL_SIDEBAR_URL);
  return (
    <Frame
      render={<aside aria-label="Documentation" />}
      $p={2}
      $rounded="2xl"
      $lightnessOffset={0.5}
      $border
      className="grid w-64 gap-2 [--nav-icon-size:--spacing(5)]"
    >
      <NavButton render={<a href="/docs" onClick={preventNavigation} />}>
        <NavIcon>
          <Hexagon strokeWidth={1.5} />
        </NavIcon>
        <NavButtonContent>Ariakit UI</NavButtonContent>
        <ButtonSlot $kind="badge" className="ms-auto">
          <span>beta</span>
        </ButtonSlot>
      </NavButton>
      <Nav
        aria-label="Documentation sections"
        glider={[{ $state: "hover" }, {}, { $state: "focus" }]}
      >
        {sections.map((section) => (
          <NavDisclosure
            key={section.slug}
            defaultOpen
            button={
              <NavDisclosureButton icon={<section.icon strokeWidth={1.5} />}>
                {section.title}
              </NavDisclosureButton>
            }
          >
            <NavList>
              {sectionPages.map((page) => {
                const href = `/docs/${section.slug}/${page.toLowerCase()}`;
                return (
                  <li key={page}>
                    <NavLink
                      href={href}
                      tabIndex={0}
                      currentUrl={currentUrl}
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentUrl(href);
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
    </Frame>
  );
}

export default function NavExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Rows"
        description="Only the link to the current URL gets a raised surface. A trailing slash does not matter, a link to a part of the page does not count, and a disabled row fades."
        code={`
          <Nav>
            <NavLink>Overview</NavLink>
            <NavLink>Installation</NavLink>
            <NavLink>Options</NavLink>
            <NavLink>Usage</NavLink>
            <NavLink>Roadmap</NavLink>
          </Nav>
        `}
      >
        <Nav aria-label="Rows" className="w-full">
          <li>
            <NavLink
              href="/docs/overview"
              currentUrl="/docs/installation/"
              onClick={preventNavigation}
            >
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink
              href="/docs/installation"
              currentUrl="/docs/installation/"
              onClick={preventNavigation}
            >
              Installation
            </NavLink>
          </li>
          <li>
            <NavLink
              href="/docs/installation#options"
              currentUrl="/docs/installation/"
              onClick={preventNavigation}
            >
              Options
            </NavLink>
          </li>
          <li>
            <NavLink
              href="/docs/usage"
              currentUrl="/docs/installation/"
              onClick={preventNavigation}
            >
              Usage
            </NavLink>
          </li>
          <li>
            {/*
              A link without a destination is HTML's placeholder link: it leaves
              the tab order, and aria-disabled makes it read as unavailable.
              With an href it would still be focusable and still navigate.
            */}
            <NavLink role="link" aria-disabled="true">
              Roadmap
            </NavLink>
          </li>
        </Nav>
      </Example>

      <Example
        title="Touching rows"
        description="No space between the rows, so neighboring pills touch. Here the page marks the current row itself instead of passing the current URL."
        code={`
          <Nav $gap={0}>
            <NavLink>Overview</NavLink>
            <NavLink>Installation</NavLink>
            <NavLink>Usage</NavLink>
          </Nav>
        `}
      >
        <Nav $gap={0} aria-label="Touching rows" className="w-full">
          <li>
            <NavLink href="#overview">Overview</NavLink>
          </li>
          <li>
            <NavLink href="#installation" aria-current="page">
              Installation
            </NavLink>
          </li>
          <li>
            <NavLink href="#usage">Usage</NavLink>
          </li>
        </Nav>
      </Example>

      <Example
        title="Icons"
        description="The icon stays on the first line when a long label wraps."
        code={`
          <Nav $iconSize={5}>
            <NavLink>
              <NavIcon>
                <Rocket />
              </NavIcon>
              Getting started
            </NavLink>
            <NavLink>
              <NavIcon>
                <Palette />
              </NavIcon>
              Styling
            </NavLink>
            <NavLink>
              <NavIcon>
                <Accessibility />
              </NavIcon>
              …
            </NavLink>
          </Nav>
        `}
      >
        <Nav $iconSize={5} aria-label="Icons" className="w-full max-w-64">
          <li>
            <NavLink href="#getting-started">
              <NavIcon>
                <Rocket strokeWidth={1.5} />
              </NavIcon>
              Getting started
            </NavLink>
          </li>
          <li>
            <NavLink href="#styling">
              <NavIcon>
                <Palette strokeWidth={1.5} />
              </NavIcon>
              Styling
            </NavLink>
          </li>
          <li>
            <NavLink href="#accessibility" aria-current="page">
              <NavIcon>
                <Accessibility strokeWidth={1.5} />
              </NavIcon>
              Accessibility and right-to-left languages
            </NavLink>
          </li>
        </Nav>
      </Example>

      <Example
        title="Groups"
        description="Labeled groups, each with a list of its own. A label has the padding of a row, and its text aligns with the text of the rows."
        code={`
          <Nav list={false}>
            <NavGroup>
              <NavGroupLabel>Guides</NavGroupLabel>
              <NavList>
                <NavLink>Getting started</NavLink>
                <NavLink>Styling</NavLink>
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>Reference</NavGroupLabel>
              <NavList>
                <NavLink>
                  <ButtonLabel>Components</ButtonLabel>
                  <ButtonSlot $kind="badge">
                    12
                  </ButtonSlot>
                </NavLink>
                <NavLink>Hooks</NavLink>
              </NavList>
            </NavGroup>
          </Nav>
        `}
      >
        <Nav list={false} aria-label="Groups" className="w-full">
          <NavGroup>
            <NavGroupLabel>Guides</NavGroupLabel>
            <NavList>
              <li>
                <NavLink href="#getting-started" aria-current="page">
                  Getting started
                </NavLink>
              </li>
              <li>
                <NavLink href="#styling">Styling</NavLink>
              </li>
            </NavList>
          </NavGroup>
          <NavGroup>
            <NavGroupLabel>Reference</NavGroupLabel>
            <NavList>
              <li>
                <NavLink href="#components">
                  <ButtonLabel>Components</ButtonLabel>
                  <ButtonSlot $kind="badge" className="ms-auto">
                    <span>12</span>
                  </ButtonSlot>
                </NavLink>
              </li>
              <li>
                <NavLink href="#hooks">Hooks</NavLink>
              </li>
            </NavList>
          </NavGroup>
        </Nav>
      </Example>

      <Example
        title="Command row"
        description="A button row next to link rows, with the same height and icon column. Its keyboard shortcut goes to the end of the row."
        code={`
          <Nav $iconSize={5}>
            <NavButton>
              <NavIcon>
                <Search />
              </NavIcon>
              <NavButtonContent>Search</NavButtonContent>
              <ButtonSlot $kind="shortcut">⌘K</ButtonSlot>
            </NavButton>
            <NavLink>
              <NavIcon>
                <Inbox />
              </NavIcon>
              Inbox
            </NavLink>
            <NavLink>
              <NavIcon>
                <Settings />
              </NavIcon>
              Settings
            </NavLink>
          </Nav>
        `}
      >
        <Nav $iconSize={5} aria-label="Command row" className="w-full">
          <li>
            <NavButton>
              <NavIcon>
                <Search strokeWidth={1.5} />
              </NavIcon>
              <NavButtonContent>Search</NavButtonContent>
              <ButtonSlot $kind="shortcut" className="ms-auto">
                ⌘K
              </ButtonSlot>
            </NavButton>
          </li>
          <li>
            <NavLink href="#inbox">
              <NavIcon>
                <Inbox strokeWidth={1.5} />
              </NavIcon>
              Inbox
            </NavLink>
          </li>
          <li>
            <NavLink href="#settings" aria-current="page">
              <NavIcon>
                <Settings strokeWidth={1.5} />
              </NavIcon>
              Settings
            </NavLink>
          </li>
        </Nav>
      </Example>

      <Example
        title="Disclosures"
        description="Sections that open and close, with a guide line under each icon. A section that holds the current link opens by itself."
        code={`
          <Nav $iconSize={5}>
            <NavDisclosure defaultOpen button={<NavDisclosureButton icon={<Rocket />}>Getting started</NavDisclosureButton>}>
              <NavList>
                <NavLink>Introduction</NavLink>
                <NavLink>Installation</NavLink>
              </NavList>
            </NavDisclosure>
            <NavDisclosure button={<NavDisclosureButton icon={<Palette />}>Styling</NavDisclosureButton>}>
              <NavList>
                <NavLink>Introduction</NavLink>
                <NavLink>Themes</NavLink>
              </NavList>
            </NavDisclosure>
            <NavDisclosure button={<NavDisclosureButton icon={<Blocks />}>Composition</NavDisclosureButton>}>
              <NavList>
                <NavLink>Introduction</NavLink>
              </NavList>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav $iconSize={5} aria-label="Disclosures" className="w-full">
          <NavDisclosure
            defaultOpen
            button={
              <NavDisclosureButton icon={<Rocket strokeWidth={1.5} />}>
                Getting started
              </NavDisclosureButton>
            }
          >
            <NavList>
              <li>
                <NavLink
                  href="/docs/start/introduction"
                  currentUrl="/docs/styling/introduction"
                  onClick={preventNavigation}
                >
                  Introduction
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/docs/start/installation"
                  currentUrl="/docs/styling/introduction"
                  onClick={preventNavigation}
                >
                  Installation
                </NavLink>
              </li>
            </NavList>
          </NavDisclosure>
          <NavDisclosure
            button={
              <NavDisclosureButton icon={<Palette strokeWidth={1.5} />}>
                Styling
              </NavDisclosureButton>
            }
          >
            <NavList>
              <li>
                <NavLink
                  href="/docs/styling/introduction"
                  currentUrl="/docs/styling/introduction"
                  onClick={preventNavigation}
                >
                  Introduction
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/docs/styling/themes"
                  currentUrl="/docs/styling/introduction"
                  onClick={preventNavigation}
                >
                  Themes
                </NavLink>
              </li>
            </NavList>
          </NavDisclosure>
          <NavDisclosure
            button={
              <NavDisclosureButton icon={<Blocks strokeWidth={1.5} />}>
                Composition
              </NavDisclosureButton>
            }
          >
            <NavList>
              <li>
                <NavLink
                  href="/docs/composition/introduction"
                  currentUrl="/docs/styling/introduction"
                  onClick={preventNavigation}
                >
                  Introduction
                </NavLink>
              </li>
            </NavList>
          </NavDisclosure>
        </Nav>
      </Example>

      {(["ltr", "rtl"] as const).map((dir) => (
        <Example
          key={dir}
          title={`Disclosures without icons (${dir})`}
          description="A start indicator gives the guide its own column. Labels and child links align in each nested section."
          code={`
            <Nav dir="${dir}">
              <NavDisclosure button="Documentation" defaultOpen>
                <NavList>
                  <li><NavLink href="#overview">Overview</NavLink></li>
                  <NavDisclosure button="Components" defaultOpen>
                    <NavList>
                      <li><NavLink href="#buttons">Buttons</NavLink></li>
                      <li><NavLink href="#dialogs">Dialogs</NavLink></li>
                    </NavList>
                  </NavDisclosure>
                </NavList>
              </NavDisclosure>
            </Nav>
          `}
        >
          <Nav
            dir={dir}
            aria-label={`Disclosures without icons (${dir})`}
            className="w-full"
          >
            <NavDisclosure button="Documentation" defaultOpen>
              <NavList>
                <li>
                  <NavLink href="#overview" onClick={preventNavigation}>
                    Overview
                  </NavLink>
                </li>
                <NavDisclosure button="Components" defaultOpen>
                  <NavList>
                    <li>
                      <NavLink href="#buttons" onClick={preventNavigation}>
                        Buttons
                      </NavLink>
                    </li>
                    <li>
                      <NavLink href="#dialogs" onClick={preventNavigation}>
                        Dialogs
                      </NavLink>
                    </li>
                  </NavList>
                </NavDisclosure>
              </NavList>
            </NavDisclosure>
          </Nav>
        </Example>
      ))}

      <Example
        title="Nested disclosures"
        description="A section inside a section, both closed at first. The current link deep inside opens every section around it, and its cover shows there."
        code={`
          <Nav $iconSize={5} glider={[…]}>
            <NavDisclosure button={<NavDisclosureButton icon={<Blocks />}>Components</NavDisclosureButton>}>
              <NavList>
                <NavLink>Overview</NavLink>
                <NavDisclosure button={<NavDisclosureButton icon={<TextCursorInput />}>Forms</NavDisclosureButton>}>
                  <NavList>
                    <NavLink>Checkbox</NavLink>
                    <NavLink>Radio</NavLink>
                  </NavList>
                </NavDisclosure>
                <NavLink>Tabs</NavLink>
              </NavList>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav
          $iconSize={5}
          aria-label="Nested disclosures"
          glider={[{ $state: "hover" }, {}]}
          className="w-full"
        >
          <NavDisclosure
            button={
              <NavDisclosureButton icon={<Blocks strokeWidth={1.5} />}>
                Components
              </NavDisclosureButton>
            }
          >
            <NavList>
              <li>
                <NavLink
                  href="/docs/components/overview"
                  currentUrl="/docs/components/forms/checkbox/"
                  onClick={preventNavigation}
                >
                  Overview
                </NavLink>
              </li>
              <NavDisclosure
                button={
                  <NavDisclosureButton
                    icon={<TextCursorInput strokeWidth={1.5} />}
                  >
                    Forms
                  </NavDisclosureButton>
                }
              >
                <NavList>
                  <li>
                    <NavLink
                      href="/docs/components/forms/checkbox"
                      currentUrl="/docs/components/forms/checkbox/"
                      onClick={preventNavigation}
                    >
                      Checkbox
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="/docs/components/forms/radio"
                      currentUrl="/docs/components/forms/checkbox/"
                      onClick={preventNavigation}
                    >
                      Radio
                    </NavLink>
                  </li>
                </NavList>
              </NavDisclosure>
              <li>
                <NavLink
                  href="/docs/components/tabs"
                  currentUrl="/docs/components/forms/checkbox/"
                  onClick={preventNavigation}
                >
                  Tabs
                </NavLink>
              </li>
            </NavList>
          </NavDisclosure>
        </Nav>
      </Example>

      <Example
        title="Bevel glider"
        description="The current row gets a raised bevel cover. Click a row to move the cover there."
        code={`
          <Nav glider={{ $kind: "bevel" }}>
            <NavLink>Overview</NavLink>
            <NavLink>Installation</NavLink>
            <NavLink>Usage</NavLink>
            <NavLink>Changelog</NavLink>
          </Nav>
        `}
      >
        <DemoNav
          aria-label="Bevel glider"
          glider={{ $kind: "bevel" }}
          className="w-full"
        />
      </Example>

      <Example
        title="Bar on the guide line"
        description="A thin bar on the guide line marks the current row, which keeps its own surface. Click a link in the other section to move the bar."
        code={`
          <Nav $iconSize={5} glider={{ $kind: "bar" }}>
            <NavDisclosure defaultOpen button={<NavDisclosureButton icon={<Rocket />} />}>
              <NavList>
                <NavLink>Introduction</NavLink>
              </NavList>
            </NavDisclosure>
          </Nav>
        `}
      >
        <DemoSections
          aria-label="Bar on the guide line"
          glider={{ $kind: "bar" }}
          className="w-full"
        />
      </Example>

      <Example
        title="Bar beside a cover"
        description="A brand bar and a cover mark the current row together. The cover takes the surface of the row, and the bar stays on the guide line."
        code={`
          <Nav $iconSize={5} glider={[…]}>
            <NavDisclosure defaultOpen button={<NavDisclosureButton icon={<Rocket />} />}>
              <NavList>
                <NavLink>Introduction</NavLink>
              </NavList>
            </NavDisclosure>
          </Nav>
        `}
      >
        <DemoSections
          aria-label="Bar beside a cover"
          glider={[{ $kind: "bar", $layer: "brand" }, {}]}
          className="w-full"
        />
      </Example>

      <Example
        title="Bar without a guide"
        description="With no guide line around the row, the bar sits on the start edge of the current row."
        code={`
          <Nav glider={{ $kind: "bar" }}>
            <NavLink>Overview</NavLink>
            <NavLink>Installation</NavLink>
            <NavLink>Usage</NavLink>
            <NavLink>Changelog</NavLink>
          </Nav>
        `}
      >
        <DemoNav
          aria-label="Bar without a guide"
          glider={{ $kind: "bar" }}
          className="w-full"
        />
      </Example>

      <Example
        title="Bar at the end"
        description="The bar sits on the end edge of the current row."
        code={`
          <Nav glider={{ $kind: "bar", $side: "end" }}>
            <NavLink>Overview</NavLink>
            <NavLink>Installation</NavLink>
            <NavLink>Usage</NavLink>
            <NavLink>Changelog</NavLink>
          </Nav>
        `}
      >
        <DemoNav
          aria-label="Bar at the end"
          glider={{ $kind: "bar", $side: "end" }}
          className="w-full"
        />
      </Example>

      <Example
        title="Sidebar"
        description="A documentation sidebar. A cover follows the pointer, the current cover moves between sections on click, and a ring follows the keyboard."
        code={`
          <Frame render={<aside />} $p={2} $rounded="2xl" $lightnessOffset={0.5} $border>
            <NavButton render={<a />}>
              <NavIcon>
                <Hexagon />
              </NavIcon>
              <NavButtonContent>Ariakit UI</NavButtonContent>
              <ButtonSlot $kind="badge">
                beta
              </ButtonSlot>
            </NavButton>
            <Nav glider={[…]}>
              <NavDisclosure defaultOpen button={<NavDisclosureButton icon={<Rocket />} />}>
                <NavList>
                  <NavLink>Introduction</NavLink>
                </NavList>
              </NavDisclosure>
            </Nav>
          </Frame>
        `}
      >
        <DocumentationSidebar />
      </Example>

      <Example
        title="Right to left groups"
        description="In a right-to-left direction the labels, the icons, the badge and the shortcut are mirrored. The shortcut keeps its keys in order."
        code={`
          <div dir="rtl">
            <Nav list={false} $iconSize={5}>
              <NavGroup>
                <NavGroupLabel>الأدلة</NavGroupLabel>
                <NavList>
                  <NavLink>
                    <NavIcon>
                      <Rocket />
                    </NavIcon>
                    البدء
                  </NavLink>
                  <NavLink>
                    <NavIcon>
                      <Palette />
                    </NavIcon>
                    التنسيق
                  </NavLink>
                </NavList>
              </NavGroup>
              <NavGroup>
                <NavGroupLabel>المرجع</NavGroupLabel>
                <NavList>
                  <NavLink>
                    <NavIcon>
                      <FileCode />
                    </NavIcon>
                    <ButtonLabel>المكونات</ButtonLabel>
                    <ButtonSlot $kind="badge">
                      12
                    </ButtonSlot>
                  </NavLink>
                  <NavButton>
                    <NavIcon>
                      <Search />
                    </NavIcon>
                    <NavButtonContent>بحث</NavButtonContent>
                    <ButtonSlot $kind="shortcut">⌘K</ButtonSlot>
                  </NavButton>
                </NavList>
              </NavGroup>
            </Nav>
          </div>
        `}
      >
        <div dir="rtl" lang="ar" className="w-full">
          <Nav list={false} $iconSize={5} aria-label="التنقل">
            <NavGroup>
              <NavGroupLabel>الأدلة</NavGroupLabel>
              <NavList>
                <li>
                  <NavLink href="#start">
                    <NavIcon>
                      <Rocket strokeWidth={1.5} />
                    </NavIcon>
                    البدء
                  </NavLink>
                </li>
                <li>
                  <NavLink href="#styling" aria-current="page">
                    <NavIcon>
                      <Palette strokeWidth={1.5} />
                    </NavIcon>
                    التنسيق
                  </NavLink>
                </li>
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>المرجع</NavGroupLabel>
              <NavList>
                <li>
                  <NavLink href="#components">
                    <NavIcon>
                      <FileCode strokeWidth={1.5} />
                    </NavIcon>
                    <ButtonLabel>المكونات</ButtonLabel>
                    <ButtonSlot $kind="badge" className="ms-auto">
                      <span>12</span>
                    </ButtonSlot>
                  </NavLink>
                </li>
                <li>
                  <NavButton>
                    <NavIcon>
                      <Search strokeWidth={1.5} />
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
        </div>
      </Example>

      <Example
        title="Right to left disclosures"
        description="In a right-to-left direction the guide lines, the indents and the bar are mirrored, and the closed chevron points left."
        code={`
          <div dir="rtl">
            <Nav $iconSize={5} glider={{ $kind: "bar" }}>
              <NavDisclosure defaultOpen button={<NavDisclosureButton icon={<Rocket />}>البدء</NavDisclosureButton>}>
                <NavList>
                  <NavLink>مقدمة</NavLink>
                  <NavLink>التثبيت</NavLink>
                </NavList>
              </NavDisclosure>
              <NavDisclosure button={<NavDisclosureButton icon={<Palette />}>التنسيق</NavDisclosureButton>}>
                <NavList>
                  <NavLink>السمات</NavLink>
                </NavList>
              </NavDisclosure>
            </Nav>
          </div>
        `}
      >
        <div dir="rtl" lang="ar" className="w-full">
          <Nav $iconSize={5} glider={{ $kind: "bar" }} aria-label="الأقسام">
            <NavDisclosure
              defaultOpen
              button={
                <NavDisclosureButton icon={<Rocket strokeWidth={1.5} />}>
                  البدء
                </NavDisclosureButton>
              }
            >
              <NavList>
                <li>
                  <NavLink href="#intro" aria-current="page">
                    مقدمة
                  </NavLink>
                </li>
                <li>
                  <NavLink href="#install">التثبيت</NavLink>
                </li>
              </NavList>
            </NavDisclosure>
            <NavDisclosure
              button={
                <NavDisclosureButton icon={<Palette strokeWidth={1.5} />}>
                  التنسيق
                </NavDisclosureButton>
              }
            >
              <NavList>
                <li>
                  <NavLink href="#themes">السمات</NavLink>
                </li>
              </NavList>
            </NavDisclosure>
          </Nav>
        </div>
      </Example>

      <Example
        title="On a brand layer"
        description="On a strong brand color, the rows, the current surface and the disabled text adapt to the brand surface."
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <Nav>
              <NavLink>Overview</NavLink>
              <NavLink>Installation</NavLink>
              <NavLink>Usage</NavLink>
              <NavLink>Roadmap</NavLink>
            </Nav>
          </Frame>
        `}
      >
        {/*
          The padding is at least 1rem, so the rows keep their own radius
          instead of turning square to stay concentric with the frame.
        */}
        <Frame $layer="brand" $rounded="xl" $p={4} className="w-full">
          <Nav aria-label="On a brand layer">
            <li>
              <NavLink href="#overview">Overview</NavLink>
            </li>
            <li>
              <NavLink href="#installation" aria-current="page">
                Installation
              </NavLink>
            </li>
            <li>
              <NavLink href="#usage">Usage</NavLink>
            </li>
            <li>
              <NavLink role="link" aria-disabled="true">
                Roadmap
              </NavLink>
            </li>
          </Nav>
        </Frame>
      </Example>

      {/*
        Regression fixtures: Nav scenarios migrated from the nav-interactions
        sandbox.
      */}
      <Example
        title="Current page in a dialog"
        description="A current link inside an unrelated non-modal dialog leaves the dialog closed."
        code={`
          <ak.DialogProvider>
            <ak.DialogDisclosure>Open navigation dialog</ak.DialogDisclosure>
            <ak.Dialog>
              <Nav>
                <NavLink>Documentation</NavLink>
              </Nav>
              <ak.DialogDismiss>Close navigation dialog</ak.DialogDismiss>
            </ak.Dialog>
          </ak.DialogProvider>
        `}
      >
        <Ariakit.DialogProvider>
          <Ariakit.DialogDisclosure>
            Open navigation dialog
          </Ariakit.DialogDisclosure>
          <Ariakit.Dialog aria-label="Navigation dialog" modal={false}>
            <Nav>
              <li>
                <NavLink href="/docs" currentUrl="/docs">
                  Documentation
                </NavLink>
              </li>
            </Nav>
            <Ariakit.DialogDismiss>
              Close navigation dialog
            </Ariakit.DialogDismiss>
          </Ariakit.Dialog>
        </Ariakit.DialogProvider>
      </Example>

      <Example
        title="Section across an unrelated provider"
        description="A current link opens its section even when an unrelated dialog provider sits between them, and it leaves that dialog closed."
        code={`
          <Nav>
            <NavDisclosure button="Account pages">
              <ak.DialogProvider>
                <ak.DialogDisclosure>Open account settings</ak.DialogDisclosure>
                <NavLink>Account overview</NavLink>
                <ak.Dialog>
                  <ak.DialogHeading>Account settings</ak.DialogHeading>
                  <ak.DialogDismiss>Close account settings</ak.DialogDismiss>
                </ak.Dialog>
              </ak.DialogProvider>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav>
          <NavDisclosure button="Account pages">
            <Ariakit.DialogProvider>
              <Ariakit.DialogDisclosure>
                Open account settings
              </Ariakit.DialogDisclosure>
              <NavLink href="/account" currentUrl="/account">
                Account overview
              </NavLink>
              <Ariakit.Dialog aria-label="Account settings" modal={false}>
                <Ariakit.DialogHeading>Account settings</Ariakit.DialogHeading>
                <Ariakit.DialogDismiss>
                  Close account settings
                </Ariakit.DialogDismiss>
              </Ariakit.Dialog>
            </Ariakit.DialogProvider>
          </NavDisclosure>
        </Nav>
      </Example>

      <Example
        title="Explicit disclosure parts"
        description="An explicit NavDisclosureButton and NavDisclosureContent, without the button prop, render exactly one button and one content."
        code={`
          <Nav>
            <NavDisclosure>
              <NavDisclosureButton>Project pages</NavDisclosureButton>
              <NavDisclosureContent>
                <NavList>
                  <li>
                    <NavLink>All projects</NavLink>
                  </li>
                </NavList>
              </NavDisclosureContent>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav aria-label="Project navigation">
          <NavDisclosure>
            <NavDisclosureButton>Project pages</NavDisclosureButton>
            <NavDisclosureContent>
              <NavList>
                <li>
                  <NavLink href="/projects" currentUrl="/account">
                    All projects
                  </NavLink>
                </li>
              </NavList>
            </NavDisclosureContent>
          </NavDisclosure>
        </Nav>
      </Example>

      <Example
        title="Disclosure badges"
        description="An explicit label keeps its badge beside the text, with or without a description."
        code={`
          <NavDisclosureButton label="Team pages" description="All pages in this workspace">
            <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
          </NavDisclosureButton>
        `}
      >
        <Nav>
          <NavDisclosure defaultOpen>
            <NavDisclosureButton label="Project pages">
              <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
            </NavDisclosureButton>
            <NavDisclosureContent>
              <NavLink href="/pages/settings" currentUrl="/account">
                Manage project pages
              </NavLink>
            </NavDisclosureContent>
          </NavDisclosure>
          <NavDisclosure defaultOpen>
            <NavDisclosureButton
              label={<CustomLabel id="nav-pages-label">Team pages</CustomLabel>}
              description="All pages in this workspace"
            >
              <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
            </NavDisclosureButton>
            <NavDisclosureContent>
              <NavLink href="/pages/settings" currentUrl="/account">
                Manage team pages
              </NavLink>
            </NavDisclosureContent>
          </NavDisclosure>
        </Nav>
      </Example>

      <Example
        title="Custom label styles"
        description="A caller's className and style on NavButtonContent survive next to its own classes."
        code={`
          <Nav>
            <NavButton>
              <NavIcon>A</NavIcon>
              <NavButtonContent>Account menu</NavButtonContent>
            </NavButton>
          </Nav>
        `}
      >
        <Nav aria-label="Account navigation">
          <li>
            <NavButton>
              <NavIcon aria-hidden>A</NavIcon>
              <NavButtonContent
                className="font-semibold"
                style={{ color: "rgb(128, 0, 128)" }}
              >
                Account menu
              </NavButtonContent>
            </NavButton>
          </li>
        </Nav>
      </Example>

      <Example
        title="Optional navigation headings"
        description="A false button prop renders the links without a disclosure, and zero still counts as a button label. A checkbox toggles the heading."
        code={`
          <Nav>
            <NavDisclosure button={false}>
              <NavLink>Workspace members</NavLink>
              <NavLink>Workspace settings</NavLink>
            </NavDisclosure>
          </Nav>
          <Nav>
            <NavDisclosure button={0}>
              <NavLink>Invitation settings</NavLink>
            </NavDisclosure>
          </Nav>
        `}
      >
        <NavOptionalHeadings />
      </Example>
    </ExampleGrid>
  );
}
