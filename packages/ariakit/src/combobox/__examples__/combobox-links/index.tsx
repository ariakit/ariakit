import { useMemo } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxStore,
} from "ariakit/combobox/store";
import { matchSorter } from "match-sorter";
import { NewWindow } from "./icons";
import "./style.css";

const links = [
  {
    href: "https://twitter.com/ariakitjs",
    children: "Twitter",
    target: "_blank",
  },
  {
    href: "https://www.facebook.com/ariakitjs",
    children: "Facebook",
    target: "_blank",
  },
  {
    href: "https://www.instagram.com/ariakitjs",
    children: "Instagram",
    target: "_blank",
  },
  { href: "https://ariakit.org", children: "Ariakit.org" },
];

export default function Example() {
  const combobox = useComboboxStore({
    gutter: 4,
    sameWidth: true,
  });

  const mounted = combobox.useState("mounted");
  const value = combobox.useState("value");

  const matches = useMemo(
    () =>
      matchSorter(links, value, {
        keys: ["children"],
        baseSort: (a, b) => (a.index < b.index ? -1 : 1),
      }),
    [value]
  );

  const renderItem = (item: typeof links[number], i: number) => {
    return (
      <ComboboxItem
        key={item.children + i}
        as="a"
        focusOnHover
        hideOnClick
        className="combobox-item"
        {...item}
      >
        {item.children}
        {item.target === "_blank" && (
          <NewWindow className="combobox-item-icon" />
        )}
      </ComboboxItem>
    );
  };

  return (
    <div className="wrapper">
      <label className="label">
        Links
        <Combobox
          store={combobox}
          placeholder="e.g., Twitter"
          className="combobox"
          autoSelect
        />
      </label>
      {mounted && (
        <ComboboxPopover store={combobox} className="popover">
          {matches.length ? (
            matches.map(renderItem)
          ) : (
            <div className="no-results">No results found</div>
          )}
        </ComboboxPopover>
      )}
    </div>
  );
}
