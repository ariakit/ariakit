import "./style.css";
import { useId, useMemo, useState } from "react";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import {
  Combobox,
  ComboboxItem,
  ComboboxPanel,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxTab,
  ComboboxTabList,
} from "./combobox.jsx";
import { flatPages, pages } from "./pages.js";

const categories = ["All", ...Object.keys(pages)];

function getTabId(category: string, prefix: string) {
  return `${prefix}/${category}`;
}

function getCategory(tabId: string, prefix: string) {
  return tabId.replace(`${prefix}/`, "");
}

export default function Example() {
  const prefix = useId();
  const [searchValue, setSearchValue] = useState("");
  const [tabId, setTabId] = useState(getTabId("Components", prefix));

  const matches = useMemo(() => {
    const keys = ["label", "path"];
    const allMatches = matchSorter(flatPages, searchValue, { keys });
    const groups = groupBy(allMatches, "category");
    groups.All = allMatches;
    return groups;
  }, [searchValue]);

  const currentPages = matches[getCategory(tabId, prefix)] || [];

  return (
    <ComboboxProvider
      defaultTabId={tabId}
      onTabChange={setTabId}
      onSearch={setSearchValue}
    >
      <Combobox placeholder="Search pages" />
      <ComboboxPopover aria-label="Pages">
        <ComboboxTabList aria-label="Categories">
          {categories.map((category) => {
            const currentPages = matches[category];
            return (
              <ComboboxTab
                key={category}
                id={getTabId(category, prefix)}
                disabled={!currentPages?.length}
              >
                {category}
                <span className="count">{currentPages?.length || 0}</span>
              </ComboboxTab>
            );
          })}
        </ComboboxTabList>
        <ComboboxPanel>
          {!currentPages.length && (
            <div className="no-results">
              No pages found for &quot;<strong>{searchValue}</strong>
              &quot;
            </div>
          )}
          {currentPages.map((page, i) => (
            <ComboboxItem
              key={page.path + i}
              render={<a href={page.path} target="_blank" rel="noreferrer" />}
            >
              {page.label}
            </ComboboxItem>
          ))}
        </ComboboxPanel>
      </ComboboxPopover>
    </ComboboxProvider>
  );
}
