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
  ComboboxTabs,
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
    const allMatches = matchSorter(flatPages, searchValue, {
      keys,
      threshold: matchSorter.rankings.NO_MATCH,
    });
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
        <ComboboxTabs aria-label="Categories">
          {categories.map((category) => {
            const currentPages = matches[category];
            return (
              <ComboboxTab
                key={category}
                disabled={!currentPages?.length}
                id={getTabId(category, prefix)}
              >
                {category}
                <span className="count">{currentPages?.length || 0}</span>
              </ComboboxTab>
            );
          })}
        </ComboboxTabs>
        <ComboboxPanel>
          {!currentPages.length && (
            <div className="no-results">
              No pages found for &quot;<strong>{searchValue}</strong>
              &quot;
            </div>
          )}
          {currentPages.map((page) => (
            // TODO: Fix flash that only happens when the items are re-ordered,
            // but no items are added or removed. Go to the Guide tab and type
            // S.
            <ComboboxItem key={page.path} render={<a href={page.path} />}>
              {page.label}
            </ComboboxItem>
          ))}
        </ComboboxPanel>
      </ComboboxPopover>
    </ComboboxProvider>
  );
}
