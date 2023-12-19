import "./style.css";
import { useId, useMemo, useState } from "react";
import { CompositeRenderer } from "@ariakit/react-core/composite/composite-renderer";
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

  const deferredPages = matches[getCategory(tabId, prefix)];

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
          {!deferredPages?.length && (
            <div className="no-results">
              No pages found for &quot;<strong>{searchValue}</strong>
              &quot;
            </div>
          )}
          <CompositeRenderer
            itemSize={40}
            items={deferredPages}
            orientation="vertical"
          >
            {({ path, label, ...page }) => (
              <ComboboxItem key={label} render={<a href={path} />} {...page}>
                {label}
              </ComboboxItem>
            )}
          </CompositeRenderer>
        </ComboboxPanel>
      </ComboboxPopover>
    </ComboboxProvider>
  );
}
