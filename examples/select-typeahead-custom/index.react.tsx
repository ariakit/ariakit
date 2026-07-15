import * as Ariakit from "@ariakit/react";
import "./style.css";

// The rendered label includes a flag emoji, so the item's text content starts
// with the emoji rather than the country name. Without `typeaheadText`,
// typeahead would try to match against "🇧🇷 Brazil" and fail. Setting
// `typeaheadText` to the plain country name makes typing "b" focus Brazil.
const countries = [
  { value: "Brazil", flag: "🇧🇷" },
  { value: "Canada", flag: "🇨🇦" },
  { value: "Japan", flag: "🇯🇵" },
  { value: "Mexico", flag: "🇲🇽" },
  { value: "United States", flag: "🇺🇸" },
  { value: "Venezuela", flag: "🇻🇪", disabled: true },
];

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.SelectProvider defaultValue="Brazil">
        <Ariakit.SelectLabel className="label">Country</Ariakit.SelectLabel>
        <Ariakit.Select className="button" />
        <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
          {countries.map((country) => (
            <Ariakit.SelectItem
              key={country.value}
              className="select-item"
              value={country.value}
              typeaheadText={country.value}
              disabled={country.disabled}
            >
              {country.flag} {country.value}
            </Ariakit.SelectItem>
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  );
}
