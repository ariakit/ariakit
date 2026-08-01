import * as Ariakit from "@ariakit/react";
// The baseline renders the ordinary items published in 0.4.14, the release that
// introduced the offscreen feature. Both copies end up in this fixture's bundle,
// which costs page load rather than any measured interaction.
import * as AriakitLegacy from "@ariakit/react-v0.4.14";
import { startTransition, useMemo, useState } from "react";
import { useItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import "./style.css";

const itemCount = 1000;
const items = Array.from({ length: itemCount }, (_, index) => {
  return `Item ${String(index + 1).padStart(4, "0")}`;
});

function useMatches(searchValue: string) {
  return useMemo(() => {
    const query = searchValue.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(query));
  }, [searchValue]);
}

function ComboboxFixture() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useMatches(searchValue);

  return (
    <Ariakit.ComboboxProvider
      setValue={(value) => {
        startTransition(() => setSearchValue(value));
      }}
    >
      <Ariakit.ComboboxLabel className="label">
        Search items
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox className="combobox" placeholder="Search items" />
      <Ariakit.ComboboxPopover
        className="popover"
        gutter={4}
        sameWidth
        unmountOnHide
      >
        <Ariakit.ComboboxList>
          {matches.map((item) => (
            <Ariakit.ComboboxItem
              key={item}
              className="item"
              data-item={item}
              value={item}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function LegacyComboboxFixture() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useMatches(searchValue);

  return (
    <AriakitLegacy.ComboboxProvider
      setValue={(value) => {
        startTransition(() => setSearchValue(value));
      }}
    >
      <AriakitLegacy.ComboboxLabel className="label">
        Search items
      </AriakitLegacy.ComboboxLabel>
      <AriakitLegacy.Combobox className="combobox" placeholder="Search items" />
      <AriakitLegacy.ComboboxPopover
        className="popover"
        gutter={4}
        sameWidth
        unmountOnHide
      >
        <AriakitLegacy.ComboboxList>
          {matches.map((item) => (
            <AriakitLegacy.ComboboxItem
              key={item}
              className="item"
              data-item={item}
              value={item}
            />
          ))}
        </AriakitLegacy.ComboboxList>
      </AriakitLegacy.ComboboxPopover>
    </AriakitLegacy.ComboboxProvider>
  );
}

export default function Example() {
  const variant = useItemVariant();

  return (
    <main className="root">
      <output aria-label="Item variant">{variant}</output>
      {variant === "legacy" ? <LegacyComboboxFixture /> : <ComboboxFixture />}
    </main>
  );
}
