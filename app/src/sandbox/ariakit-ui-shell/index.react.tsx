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
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import {
  Nav,
  NavIcon,
  NavLink,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellBreakout,
  ShellFooter,
  ShellHeader,
  ShellHeaderCenter,
  ShellHeaderEnd,
  ShellHeaderStart,
  ShellMainIntro,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import type { ShellHeaderProps } from "@ariakit/ui/components/shell.ariakit.react";
import {
  Bell,
  ChartBar,
  Hash,
  Hexagon,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  PanelLeft,
  PanelRight,
  SendHorizontal,
  Settings,
  Users,
} from "lucide-react";
import { createContext, useContext, useId, useState } from "react";
import type { ReactNode } from "react";
import { PartsScenario } from "./parts.react.tsx";
import { GeometryScenario, NestedScenario } from "./scenarios.react.tsx";

/**
 * The sandbox is one page with one shell at a time, because a shell is the
 * page: its header sticks to the viewport, its sidebars scroll with the page
 * and its main area is the page's main landmark. A select in every header
 * switches between the scenarios, one per use case the Shell is designed for,
 * followed by the regression scenarios.
 */
const scenarios = {
  docs: "Docs site",
  dashboard: "Dashboard",
  chat: "Chat app",
  settings: "Settings page",
  marketing: "Marketing page",
  bar: "Bar parts",
  static: "Static panel",
  geometry: "Layout details",
  nested: "Nested shells",
  parts: "Main and sidebar parts",
} as const;

type ScenarioId = keyof typeof scenarios;

interface ScenarioState {
  scenario: ScenarioId;
  setScenario: (scenario: ScenarioId) => void;
  rtl: boolean;
  setRtl: (rtl: boolean) => void;
}

const ScenarioContext = createContext<ScenarioState | null>(null);

function isScenarioId(value: string): value is ScenarioId {
  return Object.hasOwn(scenarios, value);
}

/** The scenario select and the direction switch, in every scenario's header. */
function ScenarioControls() {
  const state = useContext(ScenarioContext);
  if (!state) return null;
  return (
    <>
      <Frame
        $p={1}
        $rounded="md"
        $border
        className="text-sm"
        render={
          <select
            aria-label="Scenario"
            value={state.scenario}
            onChange={(event) => {
              const { value } = event.currentTarget;
              if (isScenarioId(value)) {
                state.setScenario(value);
              }
            }}
          />
        }
      >
        {Object.entries(scenarios).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </Frame>
      {/* A narrow bar has no room for it: a consumer container rule. */}
      <label className="flex items-center gap-1 text-sm whitespace-nowrap @max-[40rem]/shell-header:hidden">
        <input
          type="checkbox"
          tabIndex={0}
          checked={state.rtl}
          onChange={(event) => state.setRtl(event.currentTarget.checked)}
        />
        Right to left
      </label>
    </>
  );
}

function Brand({ children = "Ariakit UI" }: { children?: ReactNode }) {
  return (
    // WebKit leaves links out of the Tab order unless full keyboard access is
    // on, so every link in the sandbox takes an explicit tab index.
    <Link
      href="#"
      tabIndex={0}
      className="flex items-center gap-2 font-semibold whitespace-nowrap no-underline"
    >
      <Hexagon strokeWidth={1.5} className="size-5" />
      {children}
    </Link>
  );
}

interface SectionLinksProps {
  label: string;
  sections: readonly { id: string; title: string }[];
  current?: string;
  onSelect?: (id: string) => void;
}

/** The rows of a sidebar: links to the page's sections, in a Nav list. */
function SectionLinks({
  label,
  sections,
  current,
  onSelect,
}: SectionLinksProps) {
  return (
    // The sidebar already renders the landmark around the content, so the nav
    // recipe goes on a plain element.
    <Nav render={<div aria-label={label} />}>
      {sections.map((section) => (
        <NavLink
          key={section.id}
          href={`#${section.id}`}
          tabIndex={0}
          aria-current={current === section.id ? "page" : undefined}
          onClick={() => onSelect?.(section.id)}
        >
          {section.title}
        </NavLink>
      ))}
    </Nav>
  );
}

const docsSections = [
  { id: "introduction", title: "Introduction" },
  { id: "installation", title: "Installation" },
  { id: "the-grid", title: "The grid" },
  { id: "sidebars", title: "Sidebars" },
  { id: "the-header", title: "The header" },
  { id: "centering", title: "Centering" },
  { id: "phones", title: "Phones" },
  { id: "printing", title: "Printing" },
] as const;

const paragraphs = [
  "The shell assembles a header, up to two sidebars per side, a main area and a footer from optional parts, in one CSS grid. Each sidebar declares its width, and the header declares its height. The shell reads their classes to arrange the page.",
  "Sidebars fold with a drawer motion, and the main area keeps its content column on the shell's center whatever the sidebars are doing, moving in step with the sidebar that is folding.",
  "Everything renders as static HTML and CSS. The sidebar panel uses data-open for its open state, so a page renders open or closed before any JavaScript runs.",
];

function DocsIntro() {
  return (
    <Prose>
      <HeadingLevel>
        <Heading>Shell</Heading>
      </HeadingLevel>
      <p>
        A layout component for documentation sites and applications. This page
        is long enough to scroll, so the header and the sidebars can show how
        they stick. Every section ends with a{" "}
        <Link href="#introduction" tabIndex={0}>
          link back to the top
        </Link>
        , so a tab through the page moves focus down it.
      </p>
    </Prose>
  );
}

/** A page-long article whose headings the table of contents links to. */
function DocsArticle() {
  return (
    <Prose>
      <HeadingLevel level={2}>
        {docsSections.map((section) => (
          <section key={section.id}>
            <Heading id={section.id}>{section.title}</Heading>
            {paragraphs.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
            <p>
              <Link href="#introduction" tabIndex={0}>
                Back to the top of {section.title}
              </Link>
            </p>
          </section>
        ))}
      </HeadingLevel>
    </Prose>
  );
}

/**
 * The Ariakit docs layout: a sticky blurred header, a sticky navigation sidebar
 * under it, a centered main with a full-width band, a table of contents below
 * the intro and a footer taller than a single line. Each sidebar has a consumer
 * toggle in the header.
 */
function DocsScenario() {
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [contentsOpen, setContentsOpen] = useState(false);
  const navigationId = useId();
  const contentsId = useId();
  const [current, setCurrent] = useState<string>(docsSections[0].id);
  return (
    <Shell style={{ color: "inherit" }}>
      <ShellHeader
        $blur
        start={
          <>
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle sidebar"
              aria-expanded={navigationOpen}
              aria-controls={navigationId}
              onClick={() => setNavigationOpen((open) => !open)}
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
            <Brand />
          </>
        }
        // A consumer container rule on the bar hides the search below 40rem of
        // bar content, so the bar never stacks.
        center={
          <ShellHeaderCenter
            $grow
            className="hidden @[40rem]/shell-header:flex"
          >
            <Input
              aria-label="Search the docs"
              placeholder="Search"
              className="w-full min-w-0"
            />
          </ShellHeaderCenter>
        }
        end={
          <ShellHeaderEnd>
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle table of contents"
              aria-expanded={contentsOpen}
              aria-controls={contentsId}
              onClick={() => setContentsOpen((open) => !open)}
            >
              <ButtonSlot>
                <PanelRight />
              </ButtonSlot>
            </Button>
            <ScenarioControls />
          </ShellHeaderEnd>
        }
      />
      <ShellSidebar
        id={navigationId}
        open={navigationOpen}
        aria-label="Documentation"
        render={<nav />}
      >
        <ShellSidebarBody>
          <SectionLinks
            label="Documentation sections"
            sections={docsSections}
            current={current}
            onSelect={setCurrent}
          />
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>
        <ShellMainIntro $centered>
          <DocsIntro />
        </ShellMainIntro>
        <ShellMainBody $centered>
          {/*
          The documented consumer rule: the page is the scroll port, outside the
          shell, so it copies the header height to keep a focused control out
          from under the sticky header.
         */}
          <style>
            {"html { scroll-padding-block-start: calc(4rem + 1px); }"}
          </style>
          <DocsArticle />
          <ShellBreakout
            $span="full"
            $layer="brand"
            $p={6}
            className="text-center font-medium"
          >
            <p>A full-width band inside the centered main</p>
          </ShellBreakout>
          <Prose>
            <p>
              The band above spans the gutters of main while the text stays in
              the content column.
            </p>
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        id={contentsId}
        open={contentsOpen}
        $side="end"
        $width="sm"
        $from="body"
        aria-label="On this page"
        render={<nav />}
      >
        <ShellSidebarBody>
          <SectionLinks label="Page sections" sections={docsSections} />
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellFooter
        start={
          <div className="ak-ink-70 py-4 text-sm">
            <p>Ariakit UI</p>
            <p>Copyright 2026 Ariakit FZ-LLC</p>
            <p>All rights reserved</p>
            <p>Made with the Shell component</p>
          </div>
        }
        end={
          <Link href="#introduction" tabIndex={0}>
            Back to top
          </Link>
        }
      />
    </Shell>
  );
}

const metrics = [
  { label: "Active users", value: "1,284" },
  { label: "Sign-ups", value: "312" },
  { label: "Revenue", value: "$48k" },
  { label: "Churn", value: "1.2%" },
  { label: "Open tickets", value: "17" },
  { label: "Uptime", value: "99.98%" },
];

const workspaceLinks = [
  { title: "Overview", icon: LayoutDashboard },
  { title: "Analytics", icon: ChartBar },
  { title: "Inbox", icon: Inbox },
  { title: "Members", icon: Users },
  { title: "Settings", icon: Settings },
];

/**
 * A dashboard: a full-height navigation sidebar beside the header, expressed as
 * an outer shell around an inner one, and a detail panel at the end. The metric
 * cards react to the width main has, so opening a sidebar re-flows them without
 * the window changing.
 */
function DashboardScenario() {
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const workspaceId = useId();
  const detailsId = useId();
  return (
    <Shell>
      <ShellSidebar
        id={workspaceId}
        open={workspaceOpen}
        $width="sm"
        $show
        aria-label="Workspace"
        render={<nav />}
      >
        <ShellSidebarBody>
          <Brand>Acme</Brand>
          <Nav render={<div aria-label="Workspace pages" />} className="mt-4">
            {workspaceLinks.map((link, index) => (
              <NavLink
                key={link.title}
                href={`#${link.title.toLowerCase()}`}
                tabIndex={0}
                aria-current={index === 0 ? "page" : undefined}
              >
                <NavIcon>
                  <link.icon strokeWidth={1.5} />
                </NavIcon>
                {link.title}
              </NavLink>
            ))}
          </Nav>
        </ShellSidebarBody>
      </ShellSidebar>
      <Shell>
        <ShellHeader
          start={
            <Button
              aria-label="Toggle sidebar"
              aria-expanded={workspaceOpen}
              aria-controls={workspaceId}
              onClick={() => setWorkspaceOpen((open) => !open)}
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
          }
          center={<Heading className="text-base">Overview</Heading>}
          end={
            <ShellHeaderEnd>
              <Button
                className="@max-3xl/shell:hidden"
                aria-label="Toggle details"
                aria-expanded={detailsOpen}
                aria-controls={detailsId}
                onClick={() => setDetailsOpen((open) => !open)}
              >
                <ButtonSlot>
                  <PanelRight />
                </ButtonSlot>
              </Button>
              <ScenarioControls />
            </ShellHeaderEnd>
          }
        />
        <ShellMain>
          <ShellMainBody>
            <div
              aria-label="Metrics"
              role="group"
              className="grid grid-cols-1 gap-4 @xl/shell-main-body:grid-cols-2 @4xl/shell-main-body:grid-cols-3"
            >
              {metrics.map((metric) => (
                <Frame
                  key={metric.label}
                  $p={4}
                  $rounded="xl"
                  $border
                  $lightnessOffset={0.5}
                >
                  <p className="ak-ink-70 text-sm">{metric.label}</p>
                  <p className="text-2xl font-semibold">{metric.value}</p>
                </Frame>
              ))}
            </div>
          </ShellMainBody>
        </ShellMain>
        <ShellSidebar
          id={detailsId}
          open={detailsOpen}
          $side="end"
          $width="lg"
          aria-label="Details"
          render={<aside />}
        >
          <ShellSidebarBody>
            <HeadingLevel level={2}>
              <Heading className="text-base">Details</Heading>
            </HeadingLevel>
            <p className="ak-ink-70 mt-2 text-sm">
              Select a metric to see its history here. The panel takes its space
              from main, so the metric cards reflow when it opens.
            </p>
          </ShellSidebarBody>
        </ShellSidebar>
      </Shell>
    </Shell>
  );
}

const channels = ["general", "design", "engineering", "random", "support"];

const messages = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  author: index % 3 === 0 ? "Ada" : index % 3 === 1 ? "Grace" : "Linus",
  text: `Message ${index + 1}: ${paragraphs[index % paragraphs.length]}`,
}));

/**
 * A chat app: two sidebars at the start (a rail then the channel list), main
 * with its own composer, a member list at the end that starts closed, and a
 * four-line status footer. The composer sticks to the bottom of the viewport
 * while main is in view, and the footer sits at the end of the page.
 */
function ChatScenario() {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const channelsId = useId();
  const [membersOpen, setMembersOpen] = useState(false);
  const membersId = useId();
  return (
    <Shell>
      <ShellHeader
        start={
          <>
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle channels"
              aria-expanded={channelsOpen}
              aria-controls={channelsId}
              onClick={() => setChannelsOpen((open) => !open)}
            >
              <ButtonSlot>
                <Hash />
              </ButtonSlot>
            </Button>
            <Heading className="text-base">general</Heading>
          </>
        }
        end={
          <ShellHeaderEnd $shrink>
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle members"
              aria-expanded={membersOpen}
              aria-controls={membersId}
              onClick={() => setMembersOpen((open) => !open)}
            >
              <ButtonSlot>
                <Users />
              </ButtonSlot>
            </Button>
            <ScenarioControls />
          </ShellHeaderEnd>
        }
      />
      <ShellSidebar $width="xs" $show aria-label="Workspaces" render={<nav />}>
        <ShellSidebarBody $p={2}>
          <ul className="grid gap-2">
            {["Acme", "Ariakit", "Bakery"].map((workspace) => (
              <li key={workspace}>
                <Button
                  aria-label={workspace}
                  $rounded="full"
                  className="size-10"
                >
                  {workspace.charAt(0)}
                </Button>
              </li>
            ))}
          </ul>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellSidebar
        id={channelsId}
        open={channelsOpen}
        $width="md"
        aria-label="Channels"
        render={<nav />}
      >
        <ShellSidebarBody>
          <Nav render={<div aria-label="Channel list" />}>
            {channels.map((channel, index) => (
              <NavLink
                key={channel}
                href={`#${channel}`}
                tabIndex={0}
                aria-current={index === 0 ? "page" : undefined}
              >
                <NavIcon>
                  <Hash strokeWidth={1.5} />
                </NavIcon>
                {channel}
              </NavLink>
            ))}
          </Nav>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>
        <ShellMainBody $centered="main" $maxWidth={200}>
          <ol aria-label="Messages" className="grid gap-4">
            {messages.map((message) => (
              <li key={message.id} id={`message-${message.id}`}>
                <p className="text-sm font-semibold">{message.author}</p>
                <p className="ak-ink-80">{message.text}</p>
              </li>
            ))}
          </ol>
          <form
            className="sticky bottom-0 mt-4 flex gap-2 pt-2"
            onSubmit={(event) => event.preventDefault()}
          >
            <Input
              aria-label="Message"
              placeholder="Message #general"
              className="w-full min-w-0"
            />
            <Button type="submit" $layer="brand" $kind="bevel">
              <ButtonSlot>
                <SendHorizontal />
              </ButtonSlot>
              Send
            </Button>
          </form>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        id={membersId}
        open={membersOpen}
        $side="end"
        $width="sm"
        aria-label="Members"
        render={<aside />}
      >
        <ShellSidebarBody>
          <HeadingLevel level={2}>
            <Heading className="text-base">Members</Heading>
          </HeadingLevel>
          <ul className="mt-2 grid gap-2 text-sm">
            {["Ada", "Grace", "Linus", "Margaret", "Tim"].map((member) => (
              <li key={member} className="flex items-center gap-2">
                <MessageSquare className="size-4" strokeWidth={1.5} />
                {member}
              </li>
            ))}
          </ul>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellFooter
        start={
          <div className="ak-ink-70 py-2 text-xs">
            <p>Connected to Acme</p>
            <p>3 members online</p>
            <p>Last sync a minute ago</p>
            <p>Version 4.2.0</p>
          </div>
        }
      />
    </Shell>
  );
}

const settingsSections = [
  { id: "profile", title: "Profile" },
  { id: "notifications", title: "Notifications" },
  { id: "security", title: "Security" },
  { id: "billing", title: "Billing" },
] as const;

/**
 * A settings page: the same shell with fewer parts. The page owns the sidebar
 * state, the main is centered within itself, and the shell asks for a slower
 * motion, which reduced motion still switches off.
 */
function SettingsScenario() {
  const [current, setCurrent] = useState<string>(settingsSections[0].id);
  const [open, setOpen] = useState(true);
  const sectionsId = useId();
  return (
    <Shell $duration={600}>
      <ShellHeader
        start={
          <>
            <Button
              className="@max-3xl/shell:hidden"
              aria-label={open ? "Toggle sidebar" : undefined}
              aria-expanded={open}
              aria-controls={sectionsId}
              onClick={() => setOpen((open) => !open)}
            >
              {open ? (
                <ButtonSlot>
                  <PanelLeft />
                </ButtonSlot>
              ) : (
                "Sections"
              )}
            </Button>
            <Brand>Settings</Brand>
          </>
        }
        end={
          <ShellHeaderEnd $shrink>
            <Button aria-label="Notifications">
              <ButtonSlot>
                <Bell />
              </ButtonSlot>
            </Button>
            <ScenarioControls />
          </ShellHeaderEnd>
        }
      />
      <ShellSidebar
        id={sectionsId}
        open={open}
        $width="sm"
        aria-label="Settings sections"
        render={<nav />}
      >
        <ShellSidebarBody>
          <SectionLinks
            label="Sections"
            sections={settingsSections}
            current={current}
            onSelect={setCurrent}
          />
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>
        <ShellMainBody $centered="main" $maxWidth={160}>
          <Prose>
            <HeadingLevel>
              <Heading>Settings</Heading>
              <HeadingLevel>
                {settingsSections.map((section) => (
                  <section key={section.id}>
                    <Heading id={section.id}>{section.title}</Heading>
                    <p>{paragraphs[0]}</p>
                    <Input
                      aria-label={`${section.title} name`}
                      placeholder={section.title}
                    />
                  </section>
                ))}
              </HeadingLevel>
            </HeadingLevel>
          </Prose>
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}

/**
 * A marketing page: a header and a footer only, so the sidebar tracks must
 * leave no gaps. The header scrolls away with the page and stacks its center
 * links on narrow bars.
 */
function MarketingScenario() {
  return (
    <Shell>
      <ShellHeader
        $sticky={false}
        $stackCenter
        start={<Brand />}
        center={
          <ShellHeaderCenter
            render={<nav aria-label="Site" />}
            className="gap-4 text-sm"
          >
            <Link href="#features" tabIndex={0}>
              Features
            </Link>
            <Link href="#pricing" tabIndex={0}>
              Pricing
            </Link>
            <Link href="#docs" tabIndex={0}>
              Docs
            </Link>
          </ShellHeaderCenter>
        }
        end={
          <ShellHeaderEnd $shrink>
            <Button $layer="brand" $kind="bevel">
              Get started
            </Button>
            <ScenarioControls />
          </ShellHeaderEnd>
        }
      />
      <ShellMain>
        <ShellMainBody $centered $maxWidth={256}>
          <HeadingLevel>
            <Prose className="py-16 text-center">
              <Heading className="text-4xl">
                Build the page around the content
              </Heading>
              <p>{paragraphs[0]}</p>
            </Prose>
            <ShellBreakout
              $span="full"
              $layer="brand"
              $p={12}
              className="text-center"
            >
              <HeadingLevel>
                <Heading id="features">Features</Heading>
              </HeadingLevel>
            </ShellBreakout>
            <Prose className="py-16">
              <HeadingLevel>
                <Heading id="pricing">Pricing</Heading>
                <p>{paragraphs[1]}</p>
                <Heading id="docs">Docs</Heading>
                <p>{paragraphs[2]}</p>
              </HeadingLevel>
            </Prose>
          </HeadingLevel>
        </ShellMainBody>
      </ShellMain>
      <ShellFooter
        start={<p className="ak-ink-70 py-4 text-sm">Copyright 2026 Ariakit</p>}
        end={
          <Link href="#" tabIndex={0}>
            Privacy
          </Link>
        }
      />
    </Shell>
  );
}

const barPolicies = {
  default: "Default",
  shrink: "Shrink the sides",
  grow: "Grow the center",
  "shrink-center": "Shrink the center",
} as const;

type BarPolicy = keyof typeof barPolicies;

/**
 * The bar's priority policies, one at a time: the start part is 16rem of text,
 * the end part 10rem, and the center a short title, so narrowing the shell
 * shows which part gives way.
 */
function BarScenario() {
  const [policy, setPolicy] = useState<BarPolicy>("default");
  const shrinkSides = policy === "shrink";
  const partsProps: Partial<ShellHeaderProps> = {
    start: (
      <ShellHeaderStart $shrink={shrinkSides}>
        <span className="w-64 truncate">
          A start part that keeps sixteen rem of text on one line
        </span>
      </ShellHeaderStart>
    ),
    center: (
      <ShellHeaderCenter
        $grow={policy === "grow"}
        $shrink={policy === "shrink-center"}
      >
        <span className="truncate">Bar parts</span>
      </ShellHeaderCenter>
    ),
    end: (
      <ShellHeaderEnd $shrink={shrinkSides}>
        <span className="w-40 truncate">An end part of ten rem</span>
      </ShellHeaderEnd>
    ),
  };
  return (
    <Shell>
      <ShellHeader {...partsProps} />
      <ShellMain>
        <ShellMainBody $centered>
          <fieldset className="grid gap-2">
            <legend className="font-medium">Policy</legend>
            {Object.entries(barPolicies).map(([id, label]) => (
              <label key={id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bar-policy"
                  value={id}
                  checked={policy === id}
                  onChange={() => setPolicy(id as BarPolicy)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ScenarioControls />
          </div>
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}

/**
 * A permanent panel: nothing opens or closes it, and it stays visible at any
 * shell width.
 */
function StaticScenario() {
  return (
    <Shell>
      <ShellHeader start={<Brand />} end={<ScenarioControls />} />
      <ShellSidebar $show aria-label="Sections" render={<aside />}>
        <ShellSidebarBody>
          <SectionLinks label="Section list" sections={settingsSections} />
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>
        <ShellMainIntro $centered>
          <DocsIntro />
        </ShellMainIntro>
        <ShellMainBody $centered>
          <DocsArticle />
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}

const scenarioComponents = {
  docs: DocsScenario,
  dashboard: DashboardScenario,
  chat: ChatScenario,
  settings: SettingsScenario,
  marketing: MarketingScenario,
  bar: BarScenario,
  static: StaticScenario,
  geometry: () => <GeometryScenario controls={<ScenarioControls />} />,
  nested: () => <NestedScenario controls={<ScenarioControls />} />,
  parts: () => <PartsScenario controls={<ScenarioControls />} />,
} satisfies Record<ScenarioId, () => ReactNode>;

export default function ShellExamples() {
  const [scenario, setScenario] = useState<ScenarioId>("docs");
  const [rtl, setRtl] = useState(false);
  const Scenario = scenarioComponents[scenario];
  return (
    <ScenarioContext.Provider value={{ scenario, setScenario, rtl, setRtl }}>
      <div dir={rtl ? "rtl" : undefined} className="contents">
        <Scenario key={scenario} />
      </div>
    </ScenarioContext.Provider>
  );
}
