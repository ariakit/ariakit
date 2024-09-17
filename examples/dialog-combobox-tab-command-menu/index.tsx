import { Button } from "@ariakit/react";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import { useId, useMemo, useState } from "react";
import { flatPages, pages } from "../combobox-tabs/pages.ts";
import {
  CommandMenu,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuTab,
  CommandMenuTabList,
  CommandMenuTabPanel,
} from "./command-menu.tsx";
import "./theme.css";

const categories = ["All", ...Object.keys(pages)];

function getTabId(category: string, prefix: string) {
  return `${prefix}/${category}`;
}

function getCategory(tabId: string, prefix: string) {
  return tabId.replace(`${prefix}/`, "");
}

export default function Example() {
  const [open, setOpen] = useState(false);
  const prefix = useId();
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
        onClick={() => setOpen(true)}
        className="ak-focusable ak-clickable ak-button ak-button-default"
      >
        Open Command Menu
      </Button>

      <CommandMenu
        aria-label="Command Menu"
        open={open}
        setOpen={setOpen}
        onSearch={setSearchValue}
        defaultTab={tabId}
        onTabChange={setTabId}
      >
        <CommandMenuInput placeholder="Search for apps and commands..." />
        <CommandMenuTabList aria-label="Categories">
          {categories.map((category) => {
            const currentPages = matches[category];
            return (
              <CommandMenuTab
                key={category}
                id={getTabId(category, prefix)}
                disabled={!currentPages?.length}
                // rowId={"0"}
              >
                {category} ({currentPages?.length || 0})
              </CommandMenuTab>
            );
          })}
        </CommandMenuTabList>
        <CommandMenuTabPanel>
          <CommandMenuList>
            {!currentPages.length && (
              <div className="no-results">
                No pages found for &quot;<strong>{searchValue}</strong>
                &quot;
              </div>
            )}
            {currentPages.map((page, i) => (
              <CommandMenuItem
                key={page.path + i}
                // rowId={`${Math.ceil((i + 1) / 2)}`}
                // render={<a href={page.path} target="_blank" rel="noreferrer" />}
              >
                {page.label}
              </CommandMenuItem>
            ))}
          </CommandMenuList>
        </CommandMenuTabPanel>
      </CommandMenu>
    </>
  );
}
