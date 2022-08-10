import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import "./style.css";

const links = [
  { href: "https://ariakit.org", value: "Ariakit.org" },
  { href: "https://twitter.com/ariakitjs", value: "Twitter", target: "_blank" },
  {
    href: "https://www.facebook.com/ariakitjs",
    value: "Facebook",
    target: "_blank",
  },
  {
    href: "https://www.instagram.com/ariakitjs",
    value: "Instagram",
    target: "_blank",
  },
];

export default function Example() {
  const combobox = useComboboxState({
    gutter: 8,
    sameWidth: true,
  });
  return (
    <div>
      <label className="label">
        Links
        <Combobox
          state={combobox}
          placeholder="e.g., Twitter"
          className="combobox"
        />
      </label>
      <ComboboxPopover state={combobox} className="popover">
        {links.map((link) => (
          <ComboboxItem
            as="a"
            key={link.href}
            focusOnHover
            className="combobox-item"
            {...link}
          />
        ))}
      </ComboboxPopover>
    </div>
  );
}
