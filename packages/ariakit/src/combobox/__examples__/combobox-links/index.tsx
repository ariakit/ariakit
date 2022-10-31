import { useMemo } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
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
  const combobox = useComboboxState({ gutter: 4, sameWidth: true });
  const matches = useMemo(() => {
    return combobox.value
      ? matchSorter(links, combobox.value, { keys: ["children", "href"] })
      : links;
  }, [combobox.value]);

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
          state={combobox}
          placeholder="e.g., Twitter"
          className="combobox"
          autoSelect
        />
      </label>
      {combobox.mounted && (
        <ComboboxPopover state={combobox} className="popover">
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
