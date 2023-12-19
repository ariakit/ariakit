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
    const allMatches = matchSorter(flatPages, searchValue, { keys });
    const groups = groupBy(allMatches, "category");
    groups.All = allMatches;
    return groups;
  }, [searchValue]);

  const pages = matches[getCategory(tabId, prefix)] || [];

  return (
    <ComboboxProvider
      defaultTabId={tabId}
      onTabChange={setTabId}
      onSearch={setSearchValue}
    >
      <Combobox placeholder="Search pages" autoSelect={false} />
      <ComboboxPopover aria-label="Pages">
        <ComboboxTabs aria-label="Categories">
          {categories.map((category) => {
            const pages = matches[category];
            return (
              <ComboboxTab
                key={category}
                disabled={!pages?.length}
                id={getTabId(category, prefix)}
              >
                {category} <span className="count">{pages?.length || 0}</span>
              </ComboboxTab>
            );
          })}
        </ComboboxTabs>
        <ComboboxPanel>
          {!pages.length && (
            <div className="no-results">
              No pages found for &quot;<strong>{searchValue}</strong>
              &quot;
            </div>
          )}
          {pages.map((page) => (
            <ComboboxItem key={page.label} render={<a href={page.path} />}>
              {page.label}
            </ComboboxItem>
          ))}
        </ComboboxPanel>
      </ComboboxPopover>
    </ComboboxProvider>
  );
}
