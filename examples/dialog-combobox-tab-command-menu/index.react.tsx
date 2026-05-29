import { Button } from "@ariakit/react";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import { useId, useMemo, useState } from "react";
import {
  CommandMenu,
  CommandMenuFooter,
  CommandMenuGrid,
  CommandMenuGroup,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuTab,
  CommandMenuTabList,
  CommandMenuTabPanel,
} from "./command-menu.tsx";
import { flatPages, pages } from "./pages.ts";
import "./theme.css";

export default function Example() {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      <Simple />
      <WithTabs cols={1} />
      <WithTabs cols={2} />
      <WithTabs cols={3} />
    </div>
  );
}

const categories = ["All", ...Object.keys(pages)];

function getCategoryId(category: string, prefix: string) {
  return `${prefix}/${category}`;
}

function getCategoryLabel(tabId: string, prefix: string) {
  return tabId.replace(`${prefix}/`, "");
}

function Simple() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    if (!searchValue) return flatPages;
    return matchSorter(flatPages, searchValue, { keys: ["label", "path"] });
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
          {currentPages.map((page) => (
            <CommandMenuItem key={page.label} render={<a href={page.path} />}>
              <span className="truncate">{page.label}</span>
            </CommandMenuItem>
          ))}
        </CommandMenuList>
        <CommandMenuFooter />
      </CommandMenu>
    </>
  );
}

function WithTabs({ cols = 1 }: { cols?: number }) {
  const prefix = useId();

  const allLabel = "All";
  const allId = getCategoryId(allLabel, prefix);

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [tabId, setTabId] = useState(allId);
  const isAllTab = tabId === allId;

  const [allMatches, groupMatches] = useMemo(() => {
    const allMatches = searchValue
      ? matchSorter(flatPages, searchValue, { keys: ["label", "path"] })
      : flatPages;
    const groupMatches = groupBy(allMatches, "category");
    return [allMatches, groupMatches];
  }, [searchValue]);

  const matchedPages = isAllTab
    ? groupMatches
    : groupMatches[getCategoryLabel(tabId, prefix)] || [];

  const renderGrid = (pages: typeof matchedPages) => {
    if (!Array.isArray(pages)) {
      return Object.entries(pages).map(([category, pages], index) => (
        <CommandMenuGroup key={index} label={category}>
          {renderGrid(pages)}
        </CommandMenuGroup>
      ));
    }
    return (
      <CommandMenuGrid cols={cols}>
        {pages.map((page, index) => (
          <CommandMenuItem
            key={page.label}
            index={index}
            render={<a href={page.path} />}
          >
            <span className="truncate">{page.label}</span>
          </CommandMenuItem>
        ))}
      </CommandMenuGrid>
    );
  };

  return (
    <>
      <Button
        className="ak-button ak-button-default"
        onClick={() => setOpen(true)}
      >
        With Tabs{cols > 1 ? ` (${cols} columns)` : ""}
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
          {categories.map((label) => {
            const pages = label === allLabel ? allMatches : groupMatches[label];
            return (
              <CommandMenuTab
                key={label}
                id={getCategoryId(label, prefix)}
                disabled={!pages?.length}
              >
                {label} ({pages?.length || 0})
              </CommandMenuTab>
            );
          })}
        </CommandMenuTabList>
        <CommandMenuTabPanel>
          <CommandMenuList className="flex flex-col gap-4">
            {renderGrid(matchedPages)}
          </CommandMenuList>
        </CommandMenuTabPanel>
        <CommandMenuFooter />
      </CommandMenu>
    </>
  );
}
