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
import { ButtonSlot } from "@ariakit/ui/components/button.ariakit.react";
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
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavLinkSlot,
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
import { HorizontalNavigation, LinkItems } from "./api-examples.react.tsx";

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
          <NavList>
            <NavLink href="/workspace/members">Workspace members</NavLink>
            <NavLink href="/workspace/settings">Workspace settings</NavLink>
          </NavList>
        </NavDisclosure>
      </Nav>
      <Nav aria-label="Invitation navigation">
        <NavDisclosure button={0}>
          <NavList>
            <NavLink href="/invitations/settings">Invitation settings</NavLink>
          </NavList>
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
        <NavLink
          key={page}
          href={`#${page.toLowerCase()}`}
          aria-current={current === page ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            setCurrent(page);
          }}
        >
          {page}
        </NavLink>
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
                <NavLink
                  key={page}
                  href={`#${id}`}
                  aria-current={current === id ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrent(id);
                  }}
                >
                  {page}
                </NavLink>
              );
            })}
          </NavList>
        </NavDisclosure>
      ))}
    </Nav>
  );
}

const endBarPages = ["Overview", "Usage"];

interface EndBarSectionsProps {
  dir: "ltr" | "rtl";
}

/**
 * Top-level links and three open sections behind one bar on the end edge: a
 * section with an icon and its guide, one without either, and one whose body
 * the caller pads. The current link moves on click, so the bar can be compared
 * between a top-level row and a row in each section.
 */
function EndBarSections({ dir }: EndBarSectionsProps) {
  const [current, setCurrent] = useState("Overview");
  // WebKit leaves links out of the Tab order unless full keyboard access is on,
  // so every link takes an explicit tab index for the keyboard test.
  const link = (page: string) => (
    <NavLink
      key={page}
      href={`#${page.toLowerCase()}`}
      tabIndex={0}
      aria-current={current === page ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        setCurrent(page);
      }}
    >
      {page}
    </NavLink>
  );
  return (
    <Nav
      dir={dir}
      aria-label={`End bar across sections (${dir})`}
      glider={{ $kind: "bar", $animated: false, $side: "end" }}
      className="w-full"
    >
      {endBarPages.map(link)}
      <NavDisclosure
        defaultOpen
        button={
          <NavDisclosureButton icon={<Palette strokeWidth={1.5} />}>
            Styling
          </NavDisclosureButton>
        }
      >
        <NavList>{["Themes", "Tokens"].map(link)}</NavList>
      </NavDisclosure>
      <NavDisclosure
        defaultOpen
        button={
          <NavDisclosureButton indicator="chevron-right-end">
            Components
          </NavDisclosureButton>
        }
        content={{ guide: false }}
      >
        <NavList>{["Button", "Dialog"].map(link)}</NavList>
      </NavDisclosure>
      <NavDisclosure
        defaultOpen
        button={
          <NavDisclosureButton indicator="chevron-right-end">
            Padded
          </NavDisclosureButton>
        }
        content={{ guide: false, body: { $p: 3 } }}
      >
        <NavList>{["Alpha", "Beta"].map(link)}</NavList>
      </NavDisclosure>
    </Nav>
  );
}

/**
 * Links whose author marks idle rows with an empty or false aria-current and
 * the current row with a token ARIA does not list. ARIA reads the first two as
 * not current and the unknown token as current. React's types reject the empty
 * value and the unknown token, so the values pass through a plain record, the
 * way markup outside React would carry them.
 */
function LooseCurrentSections() {
  const [current, setCurrent] = useState("Overview");
  const link = (page: string, idle: "" | "false") => {
    const currentProps: Record<string, string> = {
      "aria-current": current === page ? "active" : idle,
    };
    return (
      <NavLink
        href={`#${page.toLowerCase()}`}
        {...currentProps}
        onClick={(event) => {
          event.preventDefault();
          setCurrent(page);
        }}
      >
        {page}
      </NavLink>
    );
  };
  return (
    <Nav
      $iconSize={5}
      aria-label="Empty, false, and unknown current values"
      glider={{ $kind: "bar", $animated: false }}
      className="w-full"
    >
      {link("Overview", "")}
      <NavDisclosure
        defaultOpen
        button={
          <NavDisclosureButton icon={<Palette strokeWidth={1.5} />}>
            Styling
          </NavDisclosureButton>
        }
      >
        <NavList>
          {link("Themes", "")}
          {link("Tokens", "false")}
        </NavList>
      </NavDisclosure>
      {link("Changelog", "false")}
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
                  <NavLink
                    key={page}
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
          <NavLink
            href="/docs/overview"
            currentUrl="/docs/installation/"
            onClick={preventNavigation}
          >
            Overview
          </NavLink>
          <NavLink
            href="/docs/installation"
            currentUrl="/docs/installation/"
            onClick={preventNavigation}
          >
            Installation
          </NavLink>
          <NavLink
            href="/docs/installation#options"
            currentUrl="/docs/installation/"
            onClick={preventNavigation}
          >
            Options
          </NavLink>
          <NavLink
            href="/docs/usage"
            currentUrl="/docs/installation/"
            onClick={preventNavigation}
          >
            Usage
          </NavLink>
          {/*
            A link without a destination is HTML's placeholder link: it leaves
            the tab order, and aria-disabled makes it read as unavailable. With
            an href it would still be focusable and still navigate.
           */}
          <NavLink role="link" aria-disabled="true">
            Roadmap
          </NavLink>
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
          <NavLink href="#overview">Overview</NavLink>
          <NavLink href="#installation" aria-current="page">
            Installation
          </NavLink>
          <NavLink href="#usage">Usage</NavLink>
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
          <NavLink href="#getting-started">
            <NavIcon>
              <Rocket strokeWidth={1.5} />
            </NavIcon>
            Getting started
          </NavLink>
          <NavLink href="#styling">
            <NavIcon>
              <Palette strokeWidth={1.5} />
            </NavIcon>
            Styling
          </NavLink>
          <NavLink href="#accessibility" aria-current="page">
            <NavIcon>
              <Accessibility strokeWidth={1.5} />
            </NavIcon>
            Accessibility and right-to-left languages
          </NavLink>
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
                  <NavLinkLabel>Components</NavLinkLabel>
                  <NavLinkSlot $kind="badge" $p="md">
                    12
                  </NavLinkSlot>
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
              <NavLink href="#getting-started" aria-current="page">
                Getting started
              </NavLink>
              <NavLink href="#styling">Styling</NavLink>
            </NavList>
          </NavGroup>
          <NavGroup>
            <NavGroupLabel>Reference</NavGroupLabel>
            <NavList>
              <NavLink href="#components">
                <NavLinkLabel>Components</NavLinkLabel>
                <NavLinkSlot $kind="badge" $p="md" className="ms-auto">
                  <span>12</span>
                </NavLinkSlot>
              </NavLink>
              <NavLink href="#hooks">Hooks</NavLink>
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
          <NavLink href="#inbox">
            <NavIcon>
              <Inbox strokeWidth={1.5} />
            </NavIcon>
            Inbox
          </NavLink>
          <NavLink href="#settings" aria-current="page">
            <NavIcon>
              <Settings strokeWidth={1.5} />
            </NavIcon>
            Settings
          </NavLink>
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
              <NavLink
                href="/docs/start/introduction"
                currentUrl="/docs/styling/introduction"
                onClick={preventNavigation}
              >
                Introduction
              </NavLink>
              <NavLink
                href="/docs/start/installation"
                currentUrl="/docs/styling/introduction"
                onClick={preventNavigation}
              >
                Installation
              </NavLink>
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
              <NavLink
                href="/docs/styling/introduction"
                currentUrl="/docs/styling/introduction"
                onClick={preventNavigation}
              >
                Introduction
              </NavLink>
              <NavLink
                href="/docs/styling/themes"
                currentUrl="/docs/styling/introduction"
                onClick={preventNavigation}
              >
                Themes
              </NavLink>
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
              <NavLink
                href="/docs/composition/introduction"
                currentUrl="/docs/styling/introduction"
                onClick={preventNavigation}
              >
                Introduction
              </NavLink>
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
                  <NavLink href="#overview">Overview</NavLink>
                  <NavDisclosure button="Components" defaultOpen>
                    <NavList>
                      <NavLink href="#buttons">Buttons</NavLink>
                      <NavLink href="#dialogs">Dialogs</NavLink>
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
                <NavLink href="#overview" onClick={preventNavigation}>
                  Overview
                </NavLink>
                <NavDisclosure button="Components" defaultOpen>
                  <NavList>
                    <NavLink href="#buttons" onClick={preventNavigation}>
                      Buttons
                    </NavLink>
                    <NavLink href="#dialogs" onClick={preventNavigation}>
                      Dialogs
                    </NavLink>
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
              <NavLink
                href="/docs/components/overview"
                currentUrl="/docs/components/forms/checkbox/"
                onClick={preventNavigation}
              >
                Overview
              </NavLink>
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
                  <NavLink
                    href="/docs/components/forms/checkbox"
                    currentUrl="/docs/components/forms/checkbox/"
                    onClick={preventNavigation}
                  >
                    Checkbox
                  </NavLink>
                  <NavLink
                    href="/docs/components/forms/radio"
                    currentUrl="/docs/components/forms/checkbox/"
                    onClick={preventNavigation}
                  >
                    Radio
                  </NavLink>
                </NavList>
              </NavDisclosure>
              <NavLink
                href="/docs/components/tabs"
                currentUrl="/docs/components/forms/checkbox/"
                onClick={preventNavigation}
              >
                Tabs
              </NavLink>
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

      {(["ltr", "rtl"] as const).map((dir) => (
        <Example
          key={dir}
          title={`End bar across sections (${dir})`}
          description="A bar on the end edge marks the current row among the top-level links and in the open sections alike. The rows of a section end where their button ends and sit one nav gap under it, where their guide starts too, so the bar keeps one line. A body the caller pads keeps its rows on the label and insets their end edge, and the bar, by that padding."
          code={`
            <Nav dir="${dir}" glider={{ $kind: "bar", $animated: false, $side: "end" }}>
              <NavLink>Overview</NavLink>
              <NavDisclosure
                defaultOpen
                button={<NavDisclosureButton icon={<Palette />}>Styling</NavDisclosureButton>}
              >
                <NavList>
                  <NavLink>Themes</NavLink>
                </NavList>
              </NavDisclosure>
              <NavDisclosure
                defaultOpen
                button={<NavDisclosureButton indicator="chevron-right-end">Components</NavDisclosureButton>}
                content={{ guide: false }}
              >
                <NavList>
                  <NavLink>Button</NavLink>
                </NavList>
              </NavDisclosure>
              <NavDisclosure
                defaultOpen
                button={<NavDisclosureButton indicator="chevron-right-end">Padded</NavDisclosureButton>}
                content={{ guide: false, body: { $p: 3 } }}
              >
                <NavList>
                  <NavLink>Alpha</NavLink>
                </NavList>
              </NavDisclosure>
            </Nav>
          `}
        >
          <EndBarSections dir={dir} />
        </Example>
      ))}

      <Example
        title="Empty, false, and unknown current values"
        description="Idle links carry an empty or false aria-current, which does not count as current, and the current link carries a token ARIA does not list, which does. The rows, the bar, and the guide line follow only the current link. Click a link to move it. With the current link in the section, close the section to leave no current row in view."
        code={`
          <Nav $iconSize={5} glider={{ $kind: "bar", $animated: false }}>
            <NavLink aria-current="active">Overview</NavLink>
            <NavDisclosure
              defaultOpen
              button={<NavDisclosureButton icon={<Palette />}>Styling</NavDisclosureButton>}
            >
              <NavList>
                <NavLink aria-current="">Themes</NavLink>
                <NavLink aria-current={false}>Tokens</NavLink>
              </NavList>
            </NavDisclosure>
            <NavLink aria-current={false}>Changelog</NavLink>
          </Nav>
        `}
      >
        <LooseCurrentSections />
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
                    <NavLinkLabel>المكونات</NavLinkLabel>
                    <NavLinkSlot $kind="badge" $p="md">
                      12
                    </NavLinkSlot>
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
                <NavLink href="#start">
                  <NavIcon>
                    <Rocket strokeWidth={1.5} />
                  </NavIcon>
                  البدء
                </NavLink>
                <NavLink href="#styling" aria-current="page">
                  <NavIcon>
                    <Palette strokeWidth={1.5} />
                  </NavIcon>
                  التنسيق
                </NavLink>
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>المرجع</NavGroupLabel>
              <NavList>
                <NavLink href="#components">
                  <NavIcon>
                    <FileCode strokeWidth={1.5} />
                  </NavIcon>
                  <NavLinkLabel>المكونات</NavLinkLabel>
                  <NavLinkSlot $kind="badge" $p="md" className="ms-auto">
                    <span>12</span>
                  </NavLinkSlot>
                </NavLink>
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
                <NavLink href="#intro" aria-current="page">
                  مقدمة
                </NavLink>
                <NavLink href="#install">التثبيت</NavLink>
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
                <NavLink href="#themes">السمات</NavLink>
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
            <NavLink href="#overview">Overview</NavLink>
            <NavLink href="#installation" aria-current="page">
              Installation
            </NavLink>
            <NavLink href="#usage">Usage</NavLink>
            <NavLink role="link" aria-disabled="true">
              Roadmap
            </NavLink>
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
              <NavLink href="/docs" currentUrl="/docs">
                Documentation
              </NavLink>
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
                <NavList>
                  <NavLink>Account overview</NavLink>
                </NavList>
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
              <NavList>
                <NavLink href="/account" currentUrl="/account">
                  Account overview
                </NavLink>
              </NavList>
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
                  <NavLink>All projects</NavLink>
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
                <NavLink href="/projects" currentUrl="/account">
                  All projects
                </NavLink>
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
            <DisclosureButtonSlot $kind="badge" $p="md">3</DisclosureButtonSlot>
          </NavDisclosureButton>
        `}
      >
        <Nav>
          <NavDisclosure defaultOpen>
            <NavDisclosureButton label="Project pages">
              <DisclosureButtonSlot $kind="badge" $p="md">
                3
              </DisclosureButtonSlot>
            </NavDisclosureButton>
            <NavDisclosureContent>
              <NavList>
                <NavLink href="/pages/settings" currentUrl="/account">
                  Manage project pages
                </NavLink>
              </NavList>
            </NavDisclosureContent>
          </NavDisclosure>
          <NavDisclosure defaultOpen>
            <NavDisclosureButton
              label={<CustomLabel id="nav-pages-label">Team pages</CustomLabel>}
              description="All pages in this workspace"
            >
              <DisclosureButtonSlot $kind="badge" $p="md">
                3
              </DisclosureButtonSlot>
            </NavDisclosureButton>
            <NavDisclosureContent>
              <NavList>
                <NavLink href="/pages/settings" currentUrl="/account">
                  Manage team pages
                </NavLink>
              </NavList>
            </NavDisclosureContent>
          </NavDisclosure>

          <NavDisclosure>
            <NavDisclosureButton
              label={
                <>
                  Account <strong>pages</strong>
                </>
              }
              description="Manage account pages"
            >
              <DisclosureButtonSlot $kind="badge" $p="md">
                3
              </DisclosureButtonSlot>
            </NavDisclosureButton>
            <NavDisclosureContent>
              <p>Update account pages</p>
            </NavDisclosureContent>
          </NavDisclosure>
        </Nav>
      </Example>

      <Example
        title="Badges and avatars"
        description="A badge or an avatar keeps the one-line box of every control slot: after the label of a section row or a link row, and in the icon column of a link row. The nav's icon size sizes only the icons."
        code={`
          <Nav $iconSize={5}>
            <NavDisclosure defaultOpen button={
              <NavDisclosureButton icon={<Inbox />} label="Inbox">
                <DisclosureButtonSlot $kind="badge" $p="md">12</DisclosureButtonSlot>
              </NavDisclosureButton>
            }>
              <NavList>
                <NavLink>Unread</NavLink>
                <NavLink>Archive</NavLink>
              </NavList>
            </NavDisclosure>
            <NavDisclosure button={
              <NavDisclosureButton icon={<Palette />} label="Design">
                <DisclosureButtonSlot $kind="avatar">MK</DisclosureButtonSlot>
              </NavDisclosureButton>
            }>
              <NavList>
                <NavLink>Members</NavLink>
              </NavList>
            </NavDisclosure>
            <NavLink>
              <NavIcon>
                <FileCode />
              </NavIcon>
              <NavLinkLabel>Drafts</NavLinkLabel>
              <NavLinkSlot $kind="badge" $p="md">3</NavLinkSlot>
            </NavLink>
            <NavLink>
              <NavIcon>
                <Settings />
              </NavIcon>
              <NavLinkLabel>Profile</NavLinkLabel>
              <NavLinkSlot $kind="avatar">JD</NavLinkSlot>
            </NavLink>
            <NavLink>
              <NavIcon $kind="badge" $p="md">9</NavIcon>
              <NavLinkLabel>Notifications</NavLinkLabel>
            </NavLink>
            <NavLink>
              <NavIcon $kind="avatar">AL</NavIcon>
              <NavLinkLabel>Ana Lima</NavLinkLabel>
            </NavLink>
          </Nav>
        `}
      >
        <Nav $iconSize={5} aria-label="Badges and avatars" className="w-full">
          <NavDisclosure
            defaultOpen
            button={
              <NavDisclosureButton
                icon={<Inbox strokeWidth={1.5} />}
                label="Inbox"
              >
                <DisclosureButtonSlot $kind="badge" $p="md">
                  12
                </DisclosureButtonSlot>
              </NavDisclosureButton>
            }
          >
            <NavList>
              <NavLink href="#unread">Unread</NavLink>
              <NavLink href="#archive">Archive</NavLink>
            </NavList>
          </NavDisclosure>
          <NavDisclosure
            button={
              <NavDisclosureButton
                icon={<Palette strokeWidth={1.5} />}
                label="Design"
              >
                <DisclosureButtonSlot $kind="avatar">MK</DisclosureButtonSlot>
              </NavDisclosureButton>
            }
          >
            <NavList>
              <NavLink href="#members">Members</NavLink>
            </NavList>
          </NavDisclosure>
          <NavLink href="#drafts">
            <NavIcon>
              <FileCode strokeWidth={1.5} />
            </NavIcon>
            <NavLinkLabel>Drafts</NavLinkLabel>
            <NavLinkSlot $kind="badge" $p="md">
              3
            </NavLinkSlot>
          </NavLink>
          <NavLink href="#profile">
            <NavIcon>
              <Settings strokeWidth={1.5} />
            </NavIcon>
            <NavLinkLabel>Profile</NavLinkLabel>
            <NavLinkSlot $kind="avatar">JD</NavLinkSlot>
          </NavLink>
          <NavLink href="#notifications">
            <NavIcon $kind="badge" $p="md">
              9
            </NavIcon>
            <NavLinkLabel>Notifications</NavLinkLabel>
          </NavLink>
          <NavLink href="#ana-lima">
            <NavIcon $kind="avatar">AL</NavIcon>
            <NavLinkLabel>Ana Lima</NavLinkLabel>
          </NavLink>
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
              <NavList>
                <NavLink>Workspace members</NavLink>
                <NavLink>Workspace settings</NavLink>
              </NavList>
            </NavDisclosure>
          </Nav>
          <Nav>
            <NavDisclosure button={0}>
              <NavList>
                <NavLink>Invitation settings</NavLink>
              </NavList>
            </NavDisclosure>
          </Nav>
        `}
      >
        <NavOptionalHeadings />
      </Example>
      <Example
        title="Horizontal navigation"
        description="One scrolling row with an independently styled bar."
        code={`<Nav $layout="horizontal" $p={3} glider={{ $kind: "bar", $animated: false }}><NavLink href="#overview">Overview</NavLink></Nav>`}
      >
        <HorizontalNavigation />
      </Example>
      <Example
        title="Link item ownership"
        description="Wrapper props stay on the list item; refs and link props stay on the anchor."
        code={`<Nav><NavLink item={{ className: "project-item" }} href="#overview">Overview</NavLink></Nav>`}
      >
        <LinkItems />
      </Example>
      <Example
        title="Link descriptions"
        description="A link with a slot, a label and a description lines up with a disclosure row beside it. Only the icon takes the nav's icon size, the text wraps, and a description can share the label's line."
        code={`
          <Nav $iconSize={5}>
            <NavLink>
              <NavLinkSlot>
                <Inbox />
              </NavLinkSlot>
              <NavLinkContent>
                <NavLinkLabel>Inbox</NavLinkLabel>
                <NavLinkDescription>Messages that wait for a reply</NavLinkDescription>
              </NavLinkContent>
              <NavLinkSlot $kind="badge" $p="md">4</NavLinkSlot>
            </NavLink>
            <NavLink>
              <NavLinkSlot>
                <Rocket />
              </NavLinkSlot>
              <NavLinkContent $orientation="horizontal">
                <NavLinkLabel>Releases</NavLinkLabel>
                <NavLinkDescription>2 drafts</NavLinkDescription>
              </NavLinkContent>
            </NavLink>
            <NavDisclosure>
              <NavDisclosureButton icon={<Blocks />} label="Projects" description="Pages grouped by project" />
              <NavDisclosureContent>
                <NavList>
                  <NavLink>All projects</NavLink>
                </NavList>
              </NavDisclosureContent>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav
          $iconSize={5}
          aria-label="Link descriptions"
          className="w-full max-w-64"
        >
          <NavLink href="#inbox" aria-current="page">
            <NavLinkSlot>
              <Inbox strokeWidth={1.5} />
            </NavLinkSlot>
            <NavLinkContent>
              <NavLinkLabel>Inbox</NavLinkLabel>
              <NavLinkDescription>
                Messages that wait for a reply from you or your team
              </NavLinkDescription>
            </NavLinkContent>
            <NavLinkSlot $kind="badge" $p="md">
              4
            </NavLinkSlot>
          </NavLink>
          {/*
            The ids keep the description out of the link's name. Without them,
            as on the other rows, a link is named by all of its content.
           */}
          <NavLink
            href="#settings"
            aria-labelledby="nav-settings-label"
            aria-describedby="nav-settings-description"
          >
            <NavLinkSlot>
              <Settings strokeWidth={1.5} />
            </NavLinkSlot>
            <NavLinkContent>
              <NavLinkLabel id="nav-settings-label">
                Workspace settings and preferences
              </NavLinkLabel>
              <NavLinkDescription id="nav-settings-description">
                Members and billing
              </NavLinkDescription>
            </NavLinkContent>
          </NavLink>
          <NavLink href="#releases">
            <NavLinkSlot>
              <Rocket strokeWidth={1.5} />
            </NavLinkSlot>
            <NavLinkContent $orientation="horizontal">
              <NavLinkLabel>Releases</NavLinkLabel>
              <NavLinkDescription>2 drafts</NavLinkDescription>
            </NavLinkContent>
          </NavLink>
          <NavDisclosure>
            <NavDisclosureButton
              icon={<Blocks strokeWidth={1.5} />}
              label="Projects"
              description="Pages grouped by project"
            />
            <NavDisclosureContent>
              <NavList>
                <NavLink href="#projects">All projects</NavLink>
              </NavList>
            </NavDisclosureContent>
          </NavDisclosure>
        </Nav>
      </Example>
      <Example
        title="Wide icons"
        description="An icon wider than the line keeps its gap to the label. A link keeps the label column of a disclosure row, with a NavLinkSlot and with a NavIcon."
        code={`
          <Nav $iconSize={8}>
            <NavLink>
              <NavLinkSlot>
                <Inbox />
              </NavLinkSlot>
              <NavLinkLabel>Inbox</NavLinkLabel>
            </NavLink>
            <NavLink>
              <NavIcon>
                <Settings />
              </NavIcon>
              <NavLinkLabel>Settings</NavLinkLabel>
            </NavLink>
            <NavDisclosure>
              <NavDisclosureButton icon={<Blocks />}>Projects</NavDisclosureButton>
              <NavDisclosureContent>
                <NavList>
                  <NavLink>All projects</NavLink>
                </NavList>
              </NavDisclosureContent>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav $iconSize={8} aria-label="Wide icons" className="w-full max-w-64">
          <NavLink href="#wide-inbox">
            <NavLinkSlot>
              <Inbox strokeWidth={1.5} />
            </NavLinkSlot>
            <NavLinkLabel>Inbox</NavLinkLabel>
          </NavLink>
          <NavLink href="#wide-settings">
            <NavIcon>
              <Settings strokeWidth={1.5} />
            </NavIcon>
            <NavLinkLabel>Settings</NavLinkLabel>
          </NavLink>
          <NavDisclosure>
            <NavDisclosureButton icon={<Blocks strokeWidth={1.5} />}>
              Projects
            </NavDisclosureButton>
            <NavDisclosureContent>
              <NavList>
                <NavLink href="#wide-projects">All projects</NavLink>
              </NavList>
            </NavDisclosureContent>
          </NavDisclosure>
        </Nav>
      </Example>

      <Example
        title="Row overrides"
        description="A row can replace the defaults its nav gives it. Settings forces square corners and takes more room under its button, where its guide starts too, while Account keeps the defaults."
        code={`
          <Nav>
            <NavDisclosure button="Account">…</NavDisclosure>
            <NavDisclosure $rounded="none" $forceRounded $bodyOffset={3} button="Settings">
              <NavList>
                <NavLink>Profile</NavLink>
                <NavLink>Billing</NavLink>
              </NavList>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav aria-label="Row overrides" className="w-full">
          <NavDisclosure defaultOpen button="Account">
            <NavList>
              <NavLink href="#override-members">Members</NavLink>
              <NavLink href="#override-security">Security</NavLink>
            </NavList>
          </NavDisclosure>
          <NavDisclosure
            $rounded="none"
            $forceRounded
            $bodyOffset={3}
            defaultOpen
            button="Settings"
          >
            <NavList>
              <NavLink href="#override-profile">Profile</NavLink>
              <NavLink href="#override-billing">Billing</NavLink>
            </NavList>
          </NavDisclosure>
        </Nav>
      </Example>
    </ExampleGrid>
  );
}
