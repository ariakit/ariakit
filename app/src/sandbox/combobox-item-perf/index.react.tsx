import * as Ariakit from "@ariakit/react";
import { ComboboxItem as OffscreenComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";
import type { RefObject } from "react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import "./style.css";

const itemCount = 1000;
const items = Array.from({ length: itemCount }, (_, index) => {
  return `Item ${String(index + 1).padStart(4, "0")}`;
});

interface ComboboxItemProps {
  item: string;
  offscreen: boolean;
  offscreenRoot: RefObject<HTMLDivElement | null>;
}

function ComboboxItem({ item, offscreen, offscreenRoot }: ComboboxItemProps) {
  const props = {
    className: "item",
    "data-item": item,
    value: item,
  } as const;
  if (offscreen) {
    return (
      <OffscreenComboboxItem
        {...props}
        offscreenMode="passive"
        offscreenRoot={offscreenRoot}
      />
    );
  }
  return <Ariakit.ComboboxItem {...props} />;
}

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const [offscreen, setOffscreen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOffscreen(params.get("item") === "offscreen");
  }, []);

  const matches = useMemo(() => {
    const query = searchValue.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(query));
  }, [searchValue]);

  return (
    <main className="root">
      <output aria-label="Item variant">
        {offscreen ? "offscreen" : "base"}
      </output>
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
                offscreen={offscreen}
                offscreenRoot={popoverRef}
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </main>
  );
}
