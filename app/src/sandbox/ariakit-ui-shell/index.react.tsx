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
  ShellBleed,
  ShellFooter,
  ShellHeader,
  ShellHeaderCenter,
  ShellHeaderEnd,
  ShellHeaderStart,
  ShellMain,
  ShellSidebar,
  ShellSidebarToggle,
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
  PanelRight,
  SendHorizontal,
  Settings,
  Users,
} from "lucide-react";
import { createContext, useContext, useId, useState } from "react";
import type { ReactNode } from "react";

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
      className="flex items-center gap-2 font-semibold no-underline"
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
        <li key={section.id}>
          <NavLink
            href={`#${section.id}`}
            tabIndex={0}
            aria-current={current === section.id ? "page" : undefined}
            onClick={() => onSelect?.(section.id)}
          >
            {section.title}
          </NavLink>
        </li>
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
  "The shell assembles a header, up to two sidebars per side, a main area and a footer from optional parts, in one CSS grid. Nothing is measured and nothing is fixed to the viewport: the root declares the geometry once, and every part reads it.",
  "Sidebars fold with a drawer motion, and the main area keeps its content column on the shell's center whatever the sidebars are doing, moving in step with the sidebar that is folding.",
  "Everything renders as static HTML and CSS. The open state is one attribute on the sidebar, so a page renders open or closed before any JavaScript runs.",
];

/** A page-long article whose headings the table of contents links to. */
function DocsArticle() {
  return (
    <Prose>
      <HeadingLevel>
        <Heading>Shell</Heading>
        <p>
          A layout component for documentation sites and applications. This page
          is long enough to scroll, so the header and the sidebars can show how
          they stick. Every section ends with a{" "}
          <Link href="#introduction" tabIndex={0}>
            link back to the top
          </Link>
          , so a tab through the page moves focus down it.
        </p>
        <HeadingLevel>
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
      </HeadingLevel>
    </Prose>
  );
}

/**
 * The Ariakit docs layout: a sticky blurred header, a sticky navigation sidebar
 * under it, a centered main with a full-bleed band, a table of contents at the
 * end and a footer taller than a single line. Two stores own the two sidebars,
 * each with a toggle in the header.
 */
function DocsScenario() {
  const navigation = ak.useDisclosureStore({ defaultOpen: true });
  // The table of contents starts closed.
  const contents = ak.useDisclosureStore();
  const [current, setCurrent] = useState<string>(docsSections[0].id);
  return (
    <Shell $startWidth={64} $endWidth={48}>
      <ShellHeader
        $blur
        start={
          <>
            <ShellSidebarToggle store={navigation} />
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
          <ShellHeaderEnd $shrink>
            <ShellSidebarToggle
              store={contents}
              aria-label="Toggle table of contents"
            >
              <ButtonSlot>
                <PanelRight />
              </ButtonSlot>
            </ShellSidebarToggle>
            <ScenarioControls />
          </ShellHeaderEnd>
        }
      />
      <ShellSidebar
        store={navigation}
        aria-label="Documentation"
        render={<nav />}
      >
        <SectionLinks
          label="Documentation sections"
          sections={docsSections}
          current={current}
          onSelect={setCurrent}
        />
      </ShellSidebar>
      <ShellMain $centered>
        {/*
          The documented consumer rule: the page is the scroll port, outside the
          shell, so it copies the header height to keep a focused control out
          from under the sticky header.
         */}
        <style>{"html { scroll-padding-block-start: 3.25rem; }"}</style>
        <DocsArticle />
        <ShellBleed>
          <Frame
            $layer="brand"
            $p={6}
            $rounded="none"
            className="text-center font-medium"
          >
            A full-bleed band inside the centered main
          </Frame>
        </ShellBleed>
        <Prose>
          <p>
            The band above spans the gutters of main while the text stays in the
            content column.
          </p>
        </Prose>
      </ShellMain>
      <ShellSidebar
        store={contents}
        $side="end"
        aria-label="On this page"
        render={<nav />}
      >
        <SectionLinks label="Page sections" sections={docsSections} />
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
  const details = ak.useDisclosureStore();
  return (
    <ak.DisclosureProvider defaultOpen>
      <Shell $startWidth={56}>
        <ShellSidebar aria-label="Workspace" render={<nav />}>
          <Brand>Acme</Brand>
          <Nav render={<div aria-label="Workspace pages" />} className="mt-4">
            {workspaceLinks.map((link, index) => (
              <li key={link.title}>
                <NavLink
                  href={`#${link.title.toLowerCase()}`}
                  tabIndex={0}
                  aria-current={index === 0 ? "page" : undefined}
                >
                  <NavIcon>
                    <link.icon strokeWidth={1.5} />
                  </NavIcon>
                  {link.title}
                </NavLink>
              </li>
            ))}
          </Nav>
        </ShellSidebar>
        <Shell $endWidth={72}>
          <ShellHeader
            start={<ShellSidebarToggle />}
            center={<Heading className="text-base">Overview</Heading>}
            end={
              <ShellHeaderEnd $shrink>
                <ShellSidebarToggle store={details} aria-label="Toggle details">
                  <ButtonSlot>
                    <PanelRight />
                  </ButtonSlot>
                </ShellSidebarToggle>
                <ScenarioControls />
              </ShellHeaderEnd>
            }
          />
          <ShellMain>
            <div
              aria-label="Metrics"
              role="group"
              className="grid grid-cols-1 gap-4 @xl/shell-main:grid-cols-2 @4xl/shell-main:grid-cols-3"
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
          </ShellMain>
          <ShellSidebar
            store={details}
            $side="end"
            aria-label="Details"
            render={<aside />}
          >
            <HeadingLevel level={2}>
              <Heading className="text-base">Details</Heading>
            </HeadingLevel>
            <p className="ak-ink-70 mt-2 text-sm">
              Select a metric to see its history here. The panel takes its space
              from main, so the metric cards reflow when it opens.
            </p>
          </ShellSidebar>
        </Shell>
      </Shell>
    </ak.DisclosureProvider>
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
  const members = ak.useDisclosureStore();
  return (
    <Shell $startWidth={[14, 60]} $endWidth={56}>
      <ShellHeader
        start={
          <>
            <Button
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
            <ShellSidebarToggle store={members} aria-label="Toggle members">
              <ButtonSlot>
                <Users />
              </ButtonSlot>
            </ShellSidebarToggle>
            <ScenarioControls />
          </ShellHeaderEnd>
        }
      />
      <ShellSidebar aria-label="Workspaces" render={<nav />} body={{ $p: 2 }}>
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
      </ShellSidebar>
      <ShellSidebar
        id={channelsId}
        open={channelsOpen}
        onOpenChange={setChannelsOpen}
        aria-label="Channels"
        render={<nav />}
      >
        <Nav render={<div aria-label="Channel list" />}>
          {channels.map((channel, index) => (
            <li key={channel}>
              <NavLink
                href={`#${channel}`}
                tabIndex={0}
                aria-current={index === 0 ? "page" : undefined}
              >
                <NavIcon>
                  <Hash strokeWidth={1.5} />
                </NavIcon>
                {channel}
              </NavLink>
            </li>
          ))}
        </Nav>
      </ShellSidebar>
      <ShellMain $centered="main" $maxWidth={200}>
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
      </ShellMain>
      <ShellSidebar
        store={members}
        $side="end"
        aria-label="Members"
        render={<aside />}
      >
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
 * A settings page: the same shell with fewer parts. A DisclosureProvider owns
 * the sidebar, the main is centered within itself, and the shell asks for a
 * slower motion, which reduced motion still switches off.
 */
function SettingsScenario() {
  const [current, setCurrent] = useState<string>(settingsSections[0].id);
  const sections = ak.useDisclosureStore({ defaultOpen: true });
  const open = ak.useStoreState(sections, "open");
  return (
    <ak.DisclosureProvider store={sections}>
      <Shell $startWidth={56} $duration={600}>
        <ShellHeader
          start={
            <>
              {/*
                A label only while the sidebar is closed. While it is open the
                children are false, which counts as no content: the toggle keeps
                its icon and its default name.
               */}
              <ShellSidebarToggle>{!open && "Sections"}</ShellSidebarToggle>
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
        <ShellSidebar aria-label="Settings sections" render={<nav />}>
          <SectionLinks
            label="Sections"
            sections={settingsSections}
            current={current}
            onSelect={setCurrent}
          />
        </ShellSidebar>
        <ShellMain $centered="main" $maxWidth={160}>
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
        </ShellMain>
      </Shell>
    </ak.DisclosureProvider>
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
      <ShellMain $centered $maxWidth={256}>
        <HeadingLevel>
          <Prose className="py-16 text-center">
            <Heading className="text-4xl">
              Build the page around the content
            </Heading>
            <p>{paragraphs[0]}</p>
          </Prose>
          <ShellBleed>
            <Frame
              $layer="brand"
              $p={12}
              $rounded="none"
              className="text-center"
            >
              <HeadingLevel>
                <Heading id="features">Features</Heading>
              </HeadingLevel>
            </Frame>
          </ShellBleed>
          <Prose className="py-16">
            <HeadingLevel>
              <Heading id="pricing">Pricing</Heading>
              <p>{paragraphs[1]}</p>
              <Heading id="docs">Docs</Heading>
              <p>{paragraphs[2]}</p>
            </HeadingLevel>
          </Prose>
        </HeadingLevel>
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
      <ShellMain $centered>
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
      </ShellMain>
    </Shell>
  );
}

/**
 * A panel without a store: nothing opens or closes it, so it is a plain open
 * panel with no toggle.
 */
function StaticScenario() {
  return (
    <Shell>
      <ShellHeader start={<Brand />} end={<ScenarioControls />} />
      <ShellSidebar aria-label="Sections" render={<aside />}>
        <SectionLinks label="Section list" sections={settingsSections} />
      </ShellSidebar>
      <ShellMain $centered>
        <DocsArticle />
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
