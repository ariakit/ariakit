import "./style.css";
import { startTransition, useMemo, useState } from "react";
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
import { pages } from "./pages.js";

const categories = ["All", ...Object.keys(pages)];
const flatPages = Object.entries(pages).flatMap(([category, pages]) =>
  pages.map((page) => ({ ...page, category })),
);

export default function Example() {
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    const allMatches = matchSorter(flatPages, searchValue, {
      keys: ["label", "path"],
    });
    const groups = groupBy(allMatches, "category");
    groups.All = allMatches;
    return groups;
  }, [searchValue]);

  return (
    <ComboboxProvider
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <Combobox placeholder="Search pages" />
      <ComboboxPopover aria-label="Pages">
        <ComboboxTabs>
          {categories.map((category) => (
            <ComboboxTab key={category}>{category}</ComboboxTab>
          ))}
        </ComboboxTabs>
        {categories.map((category) => (
          <ComboboxPanel key={category}>
            {matches[category]?.map((page) => (
              <ComboboxItem key={page.label} render={<a href={page.path} />}>
                {page.label}
              </ComboboxItem>
            ))}
          </ComboboxPanel>
        ))}
      </ComboboxPopover>
    </ComboboxProvider>
  );
}
