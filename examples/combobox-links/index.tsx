import { useDeferredValue, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { NewWindow } from "./icons.jsx";
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
  const combobox = Ariakit.useComboboxStore();
  const mounted = combobox.useState("mounted");
  const value = combobox.useState("value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () =>
      matchSorter(links, deferredValue, {
        keys: ["children"],
        baseSort: (a, b) => (a.index < b.index ? -1 : 1),
      }),
    [deferredValue]
  );

  const renderItem = ({ children, ...props }: (typeof links)[number]) => {
    return (
      <Ariakit.ComboboxItem
        key={children}
        focusOnHover
        hideOnClick
        className="combobox-item"
        render={<a {...props} />}
      >
        {children}
        {props.target === "_blank" && (
          <NewWindow className="combobox-item-icon" />
        )}
      </Ariakit.ComboboxItem>
    );
  };

  return (
    <div className="wrapper">
      <label className="label">
        Links
        <Ariakit.Combobox
          store={combobox}
          placeholder="e.g., Twitter"
          className="combobox"
          autoSelect
        />
      </label>
      {mounted && (
        <Ariakit.ComboboxPopover
          store={combobox}
          gutter={4}
          sameWidth
          className="popover"
        >
          {matches.length ? (
            matches.map(renderItem)
          ) : (
            <div className="no-results">No results found</div>
          )}
        </Ariakit.ComboboxPopover>
      )}
    </div>
  );
}
