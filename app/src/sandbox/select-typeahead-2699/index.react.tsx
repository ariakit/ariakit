import * as Ariakit from "@ariakit/react";
import { SelectItem as OffscreenSelectItem } from "@ariakit/react-components/select/select-item-offscreen";
import { useState } from "react";

const countries = [
  { value: "Brazil", flag: "🇧🇷" },
  { value: "Citrus", flag: "" },
  { value: "Canada", flag: "🇨🇦" },
  { value: "Japan", flag: "🇯🇵" },
  { value: "Mexico", flag: "🇲🇽" },
];

const offscreenCountries = [
  { value: "Brazil", flag: "🇧🇷" },
  ...Array.from({ length: 25 }, (_, index) => ({
    value: `Item ${index + 1}`,
    flag: "🏳️",
  })),
  { value: "Canada", flag: "🇨🇦" },
];

export default function Example() {
  const [useAliases, setUseAliases] = useState(false);

  return (
    <>
      <Ariakit.SelectProvider defaultValue="Brazil">
        <Ariakit.SelectLabel>Country</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} sameWidth>
          {countries.map((country) => (
            <Ariakit.SelectItem
              key={country.value}
              typeaheadText={
                country.value === "Citrus"
                  ? ""
                  : useAliases && country.value === "Canada"
                    ? "Dominion"
                    : country.value
              }
              value={country.value}
            >
              <span aria-hidden>{country.flag}</span> {country.value}
            </Ariakit.SelectItem>
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
      <button type="button" onClick={() => setUseAliases(true)}>
        Use country aliases
      </button>
      <Ariakit.SelectProvider defaultValue="Brazil">
        <Ariakit.SelectLabel>Virtualized country</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover
          gutter={4}
          sameWidth
          style={{ maxHeight: 80, overflow: "auto" }}
        >
          {offscreenCountries.map((country) => (
            <OffscreenSelectItem
              key={country.value}
              offscreenMode="passive"
              typeaheadText={country.value}
              value={country.value}
              style={{ display: "block" }}
            >
              <span aria-hidden>{country.flag}</span> {country.value}
            </OffscreenSelectItem>
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </>
  );
}
