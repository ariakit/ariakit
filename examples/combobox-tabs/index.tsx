import "./style.css";
import { startTransition, useId, useMemo, useState } from "react";
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

export default function Example() {
  const prefix = useId();
  const [tabId, setTabId] = useState(getTabId("Components", prefix));
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    const keys = ["label", "path"];
    const allMatches = matchSorter(flatPages, searchValue, { keys });
    const groups = groupBy(allMatches, "category");
    groups.All = allMatches;
    return groups;
  }, [searchValue]);

  const tabs = categories.map((category) => {
    const pages = matches[category];
    return (
      <ComboboxTab
        key={category}
        disabled={!pages?.length}
        id={getTabId(category, prefix)}
      >
        {category} ({pages?.length || 0})
      </ComboboxTab>
    );
  });

  const panels = categories.map((category) => {
    const pages = matches[category];
    return (
      <ComboboxPanel key={category} tabId={getTabId(category, prefix)}>
        {!pages?.length && (
          <div className="no-results">
            No pages found for &quot;<strong>{searchValue}</strong>
            &quot;
          </div>
        )}
        {pages?.map((page) => (
          <ComboboxItem key={page.label} render={<a href={page.path} />}>
            {page.label}
          </ComboboxItem>
        ))}
      </ComboboxPanel>
    );
  });

  return (
    <ComboboxProvider
      selectedId={tabId}
      setSelectedId={(tabId) => tabId && setTabId(tabId)}
      setValue={(value) => startTransition(() => setSearchValue(value))}
    >
      <Combobox placeholder="Search pages" />
      <ComboboxPopover aria-label="Pages">
        <ComboboxTabs aria-label="Categories">{tabs}</ComboboxTabs>
        {panels}
      </ComboboxPopover>
    </ComboboxProvider>
  );
}
