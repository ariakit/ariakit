import * as Ariakit from "@ariakit/react";
import { ComboboxItem as OffscreenComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";
// The version comparison renders the ordinary items published in 0.4.14, the
// release that introduced the offscreen feature. Both copies end up in this
// fixture's bundle, which costs page load rather than any measured interaction.
import * as AriakitLegacy from "@ariakit/react-v0.4.14";
import type { RefObject } from "react";
import { startTransition, useMemo, useRef, useState } from "react";
import type { CurrentItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import { useItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import "./style.css";

const itemCount = 1000;
const items = Array.from({ length: itemCount }, (_, index) => {
  return `Item ${String(index + 1).padStart(4, "0")}`;
});

interface ComboboxItemProps {
  item: string;
  variant: CurrentItemVariant;
  offscreenRoot: RefObject<HTMLDivElement | null>;
}

function ComboboxItem({ item, variant, offscreenRoot }: ComboboxItemProps) {
  const props = {
    className: "item",
    "data-item": item,
    value: item,
  } as const;
  if (variant === "base") {
    return <Ariakit.ComboboxItem {...props} />;
  }
  return (
    <OffscreenComboboxItem
      {...props}
      offscreenMode={variant}
      offscreenRoot={offscreenRoot}
    />
  );
}

function useMatches(searchValue: string) {
  return useMemo(() => {
    const query = searchValue.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(query));
  }, [searchValue]);
}

// Mirrors the wrapper the current tree renders around every item, so both
// sides of the version comparison mount the same number of React components
// and the delta reflects the Ariakit version alone.
function LegacyComboboxItem({ item }: { item: string }) {
  return (
    <AriakitLegacy.ComboboxItem
      className="item"
      data-item={item}
      value={item}
    />
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
            <LegacyComboboxItem key={item} item={item} />
          ))}
        </AriakitLegacy.ComboboxList>
      </AriakitLegacy.ComboboxPopover>
    </AriakitLegacy.ComboboxProvider>
  );
}

function ComboboxFixture({ variant }: { variant: CurrentItemVariant }) {
  const [searchValue, setSearchValue] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
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
        ref={popoverRef}
        className="popover"
        gutter={4}
        sameWidth
        unmountOnHide
      >
        <Ariakit.ComboboxList>
          {matches.map((item) => (
            <ComboboxItem
              key={item}
              item={item}
              variant={variant}
              offscreenRoot={popoverRef}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  const variant = useItemVariant();

  return (
    <main className="root">
      <output aria-label="Item variant">{variant}</output>
      {variant === "legacy" ? (
        <LegacyComboboxFixture />
      ) : (
        <ComboboxFixture variant={variant} />
      )}
    </main>
  );
}
