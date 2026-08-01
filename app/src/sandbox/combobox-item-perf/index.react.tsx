import * as Ariakit from "@ariakit/react";
import { ComboboxItem as OffscreenComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";
import type { RefObject } from "react";
import { startTransition, useMemo, useRef, useState } from "react";
import type { ItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import { useItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import "./style.css";

const itemCount = 1000;
const items = Array.from({ length: itemCount }, (_, index) => {
  return `Item ${String(index + 1).padStart(4, "0")}`;
});

interface ComboboxItemProps {
  item: string;
  variant: ItemVariant;
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

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const variant = useItemVariant();
  const popoverRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const query = searchValue.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(query));
  }, [searchValue]);

  return (
    <main className="root">
      <output aria-label="Item variant">{variant}</output>
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
    </main>
  );
}
