import * as Ariakit from "@ariakit/react";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import type { SelectStoreItem } from "@ariakit/react-components/select/select-store";
import { useEffect, useRef, useState } from "react";

const fruits: SelectStoreItem[] = [
  { id: "apple", value: "Apple" },
  { id: "banana", value: "Banana" },
  { id: "orange", value: "Orange" },
];

interface FixtureProps {
  label: string;
  renderer?: boolean;
}

function Fixture({ label, renderer }: FixtureProps) {
  const [items, setItems] = useState<SelectStoreItem[]>([]);
  const [value, setValue] = useState("Orange");
  const selectRef = useRef<HTMLButtonElement>(null);
  const select = Ariakit.useSelectStore<string>({
    items,
    setItems,
    value,
    setValue,
  });
  const activeId = Ariakit.useStoreState(select, "activeId");
  const mounted = Ariakit.useStoreState(select, "mounted");
  const moves = Ariakit.useStoreState(select, "moves");
  const previousMoves = useRef(moves);

  // TODO: Remove this workaround after
  // https://github.com/ariakit/ariakit/issues/6733 is fixed.
  useEffect(() => {
    if (previousMoves.current === moves) return;
    previousMoves.current = moves;
    if (mounted) return;
    if (!activeId) return;
    const item = items.find((item) => item.id === activeId);
    if (!item || item.disabled || item.value == null) return;
    setValue(item.value);
  }, [activeId, items, mounted, moves]);

  const loadOptions = () => {
    setItems(fruits);
    selectRef.current?.focus();
  };

  return (
    <section>
      <h2>{label}</h2>
      <button type="button" onClick={loadOptions}>
        Load {label.toLowerCase()} options
      </button>
      <Ariakit.SelectLabel store={select}>{label}</Ariakit.SelectLabel>
      <Ariakit.Select ref={selectRef} store={select}>
        {value}
      </Ariakit.Select>
      <Ariakit.SelectPopover store={select} unmountOnHide={!renderer}>
        {renderer ? (
          <SelectRenderer<SelectStoreItem> store={select} items={items}>
            {({ value, ...item }) => (
              <Ariakit.SelectItem key={item.id} value={value} {...item} />
            )}
          </SelectRenderer>
        ) : (
          items.map((item) => <Ariakit.SelectItem key={item.id} {...item} />)
        )}
      </Ariakit.SelectPopover>
      <p>
        Active item:{" "}
        <output aria-label={`${label} active item`}>
          {activeId ?? "null"}
        </output>
      </p>
    </section>
  );
}

export default function Example() {
  return (
    <>
      <Fixture label="Fruit" />
      <Fixture label="Rendered fruit" renderer />
    </>
  );
}
