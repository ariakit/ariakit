import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
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

const list = links.map((link) => link.children);

export default function Example() {
  const combobox = useComboboxState({
    list,
    gutter: 4,
    sameWidth: true,
  });

  const renderItem = (value: string, i: number) => {
    const link = links.find((link) => link.children === value);
    return (
      <ComboboxItem
        key={value + i}
        as="a"
        focusOnHover
        hideOnClick
        className="combobox-item"
        {...link}
      >
        {value}
        {link?.target === "_blank" && (
          <NewWindow className="combobox-item-icon" />
        )}
      </ComboboxItem>
    );
  };

  return (
    <div>
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
          {combobox.matches.length ? (
            combobox.matches.map(renderItem)
          ) : (
            <div className="no-results">No results found</div>
          )}
        </ComboboxPopover>
      )}
    </div>
  );
}
