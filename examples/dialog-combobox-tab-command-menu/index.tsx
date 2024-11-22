import { Button } from "@ariakit/react";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import { type CSSProperties, useId, useMemo, useState } from "react";
import { flatPages, pages } from "../combobox-tabs/pages.ts";
import {
  CommandMenu,
  CommandMenuFooter,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuTab,
  CommandMenuTabList,
  CommandMenuTabPanel,
} from "./command-menu.tsx";
import "./theme.css";

export default function Example() {
  return (
    <>
      <Simple />
      <WithTabs />
      <WithTabsAndGrid cols={2} />
      <WithTabsAndGrid cols={3} />
    </>
  );
}

const categories = ["All", ...Object.keys(pages)];

function getTabId(category: string, prefix: string) {
  return `${prefix}/${category}`;
}

function getCategory(tabId: string, prefix: string) {
  return tabId.replace(`${prefix}/`, "");
}

function Simple() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    const keys = ["label", "path"];
    return matchSorter(flatPages, searchValue, { keys });
  }, [searchValue]);

  const currentPages = matches;

  return (
    <>
      <Button
        className="ak-button ak-button-default"
        onClick={() => setOpen(true)}
      >
        Simple
      </Button>
      <CommandMenu
        aria-label="Command Menu"
        open={open}
        setOpen={setOpen}
        onSearch={setSearchValue}
      >
        <CommandMenuInput placeholder="Search pages..." />
        <CommandMenuList>
          {currentPages.map((page, i) => (
            <CommandMenuItem key={i}>{page.label}</CommandMenuItem>
          ))}
        </CommandMenuList>
        <CommandMenuFooter />
      </CommandMenu>
    </>
  );
}

function WithTabs() {
  const prefix = useId();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [tabId, setTabId] = useState(getTabId("All", prefix));

  const matches = useMemo(() => {
    const keys = ["label", "path"];
    const allMatches = matchSorter(flatPages, searchValue, { keys });
    const groups = groupBy(allMatches, "category");
    groups.All = allMatches;
    return groups;
  }, [searchValue]);

  const currentPages = matches[getCategory(tabId, prefix)] || [];

  return (
    <>
      <Button
        className="ak-button ak-button-default"
        onClick={() => setOpen(true)}
      >
        With Tabs
      </Button>
      <CommandMenu
        aria-label="Command Menu"
        open={open}
        setOpen={setOpen}
        onSearch={setSearchValue}
        defaultTab={tabId}
        onTabChange={setTabId}
      >
        <CommandMenuInput placeholder="Search pages..." />
        <CommandMenuTabList aria-label="Categories">
          {categories.map((category) => {
            const currentPages = matches[category];
            return (
              <CommandMenuTab
                key={category}
                id={getTabId(category, prefix)}
                disabled={!currentPages?.length}
              >
                {category} ({currentPages?.length || 0})
              </CommandMenuTab>
            );
          })}
        </CommandMenuTabList>
        <CommandMenuTabPanel>
          <CommandMenuList>
            {currentPages.map((page, i) => (
              <CommandMenuItem key={i}>{page.label}</CommandMenuItem>
            ))}
          </CommandMenuList>
        </CommandMenuTabPanel>
        <CommandMenuFooter />
      </CommandMenu>
    </>
  );
}

function WithTabsAndGrid({ cols = 2 }: { cols?: number }) {
  const prefix = useId();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [tabId, setTabId] = useState(getTabId("All", prefix));

  const matches = useMemo(() => {
    const keys = ["label", "path"];
    const allMatches = matchSorter(flatPages, searchValue, { keys });
    const groups = groupBy(allMatches, "category");
    groups.All = allMatches;
    return groups;
  }, [searchValue]);

  const currentPages = matches[getCategory(tabId, prefix)] || [];

  return (
    <>
      <Button
        className="ak-button ak-button-default"
        onClick={() => setOpen(true)}
      >
        With Tabs and Grid ({cols} columns)
      </Button>
      <CommandMenu
        aria-label="Command Menu"
        open={open}
        setOpen={setOpen}
        onSearch={setSearchValue}
        defaultTab={tabId}
        onTabChange={setTabId}
      >
        <CommandMenuInput placeholder="Search pages..." />
        <CommandMenuTabList aria-label="Categories">
          {categories.map((category) => {
            const currentPages = matches[category];
            return (
              <CommandMenuTab
                key={category}
                id={getTabId(category, prefix)}
                disabled={!currentPages?.length}
                rowId="0"
              >
                {category} ({currentPages?.length || 0})
              </CommandMenuTab>
            );
          })}
        </CommandMenuTabList>
        <CommandMenuTabPanel>
          <CommandMenuList
            style={{ "--grid-cols": cols } as CSSProperties}
            className="grid grid-cols-[repeat(var(--grid-cols),minmax(0,1fr))]"
          >
            {currentPages.map((page, i) => (
              <CommandMenuItem key={i} rowId={`${Math.ceil((i + 1) / cols)}`}>
                {page.label}
              </CommandMenuItem>
            ))}
          </CommandMenuList>
        </CommandMenuTabPanel>
        <CommandMenuFooter />
      </CommandMenu>
    </>
  );
}
