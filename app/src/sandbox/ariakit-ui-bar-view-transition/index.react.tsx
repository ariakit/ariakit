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
  ButtonGroup,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import {
  ViewTransition,
  addTransitionType,
  startTransition,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";
import { startBarTransition } from "./bar-transition.ts";

function TabsExample() {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "tabs-code",
  );
  return (
    <Example
      title="Tabs"
      description="Selecting a tab moves the bar in a view transition."
      stretch
      code={`
        <Tabs
          selectedId={selectedId}
          setSelectedId={(id) =>
            startBarTransition(list, () => flushSync(() => setSelectedId(id)))
          }
        >
          <TabList className="[--bar-transition-name:tabs-bar]">
            <Tab $kind="flat" bar>Code</Tab>
            …
          </TabList>
        </Tabs>
      `}
    >
      <Tabs
        selectedId={selectedId}
        setSelectedId={(id) =>
          startBarTransition(listRef.current, () =>
            flushSync(() => setSelectedId(id)),
          )
        }
      >
        <TabList
          ref={listRef}
          aria-label="Repository"
          // Chromium often aborts scoped transitions with "Prepaint layout
          // check failed" unless the scope contains its layout.
          className="[--bar-transition-name:tabs-bar] [contain:layout]"
        >
          <Tab $kind="flat" id="tabs-code" bar>
            Code
          </Tab>
          <Tab $kind="flat" id="tabs-pull-requests" bar>
            Pull requests
          </Tab>
          <Tab $kind="flat" id="tabs-actions" bar>
            Actions
          </Tab>
          <Tab $kind="flat" id="tabs-settings" bar>
            Settings
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel tabId="tabs-code">Repository files.</TabPanel>
          <TabPanel tabId="tabs-pull-requests">Open pull requests.</TabPanel>
          <TabPanel tabId="tabs-actions">Workflow runs.</TabPanel>
          <TabPanel tabId="tabs-settings">Repository settings.</TabPanel>
        </TabPanels>
      </Tabs>
    </Example>
  );
}

const periods = ["Day", "Week", "Month", "Quarter"];

function RadioGroupExample() {
  const groupRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<string | number | null>("Week");
  return (
    <Example
      title="Radio buttons"
      description="Checking a button moves the bar in a view transition."
      code={`
        <ak.RadioProvider
          value={value}
          setValue={(value) =>
            startBarTransition(group, () => flushSync(() => setValue(value)))
          }
        >
          <ak.RadioGroup
            render={
              <ButtonGroup $border className="[--bar-transition-name:period-bar]" />
            }
          >
            <ak.Radio value="Day" render={<Button bar />}>Day</ak.Radio>
            …
          </ak.RadioGroup>
        </ak.RadioProvider>
      `}
    >
      <ak.RadioProvider
        value={value}
        setValue={(value) =>
          startBarTransition(groupRef.current, () =>
            flushSync(() => setValue(value)),
          )
        }
      >
        <ak.RadioGroup
          ref={groupRef}
          aria-label="Period"
          render={
            <ButtonGroup
              $border
              className="[--bar-transition-name:period-bar] [contain:layout]"
            />
          }
        >
          {periods.map((period) => (
            <ak.Radio key={period} value={period} render={<Button bar />}>
              {period}
            </ak.Radio>
          ))}
        </ak.RadioGroup>
      </ak.RadioProvider>
    </Example>
  );
}

interface MailFolder {
  path: string;
  label: string;
}

const mailFolders: MailFolder[] = [
  { path: "/inbox", label: "Inbox" },
  { path: "/drafts", label: "Drafts" },
  { path: "/sent", label: "Sent" },
];

const mailLabels: MailFolder[] = [
  { path: "/labels/work", label: "Work" },
  { path: "/labels/travel", label: "Travel" },
  { path: "/labels/receipts", label: "Receipts" },
];

type Starter = "helper" | "react";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ClientRoutingExample() {
  const navRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState("/inbox");
  const [starter, setStarter] = useState<Starter>("helper");
  const [loadTime, setLoadTime] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = async (nextPath: string) => {
    // Route data loads before the transition starts. The page doesn't render
    // while an update callback runs, so it would freeze during the load.
    if (loadTime) {
      setLoading(true);
      await wait(loadTime);
      setLoading(false);
    }
    if (starter === "react") {
      // React starts a document view transition for updates in a transition
      // that change a ViewTransition boundary, as routers do on navigation.
      startTransition(() => {
        addTransitionType("bar");
        setPath(nextPath);
      });
      return;
    }
    startBarTransition(navRef.current, () =>
      flushSync(() => setPath(nextPath)),
    );
  };

  const renderLink = (folder: MailFolder) => (
    <NavLink
      key={folder.path}
      href={folder.path}
      aria-current={folder.path === path ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        void navigate(folder.path);
      }}
    >
      {folder.label}
    </NavLink>
  );

  const current = [...mailFolders, ...mailLabels].find(
    (folder) => folder.path === path,
  );

  return (
    <Example
      title="Client routing"
      description="A client router moves the bar between links, across groups, in a view transition."
      wide
      code={`
        <Nav bar className="[--bar-transition-name:mail-bar]">
          <NavGroup>
            <NavLink
              href="/inbox"
              aria-current={path === "/inbox" ? "page" : undefined}
              onClick={…}
            >
              Inbox
            </NavLink>
            …
          </NavGroup>
        </Nav>
      `}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <label>
            Started by{" "}
            <select
              value={starter}
              onChange={(event) =>
                setStarter(event.target.value === "react" ? "react" : "helper")
              }
            >
              <option value="helper">startBarTransition</option>
              <option value="react">React startTransition</option>
            </select>
          </label>
          <label>
            Route data{" "}
            <select
              value={loadTime}
              onChange={(event) => setLoadTime(Number(event.target.value))}
            >
              <option value={0}>Instant</option>
              <option value={500}>Loads in 500ms</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-[12rem_1fr] gap-4">
          <Nav
            ref={navRef}
            aria-label="Mail"
            bar
            className="[--bar-transition-name:mail-bar] [contain:layout]"
          >
            <NavGroup>
              <NavList>{mailFolders.map(renderLink)}</NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>Labels</NavGroupLabel>
              <NavList>{mailLabels.map(renderLink)}</NavList>
            </NavGroup>
          </Nav>
          <ViewTransition>
            <main aria-busy={loading} className="p-4 text-sm">
              <h2 className="font-medium">{current?.label}</h2>
              <p>{loading ? "Loading…" : `Messages in ${current?.label}.`}</p>
            </main>
          </ViewTransition>
        </div>
      </div>
    </Example>
  );
}

export default function BarViewTransitionExamples() {
  return (
    <ExampleGrid>
      <TabsExample />
      <RadioGroupExample />
      <ClientRoutingExample />
    </ExampleGrid>
  );
}
