import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface GridItem {
  id: string;
  value?: string;
}

// Controlled items omit `rowId`: it is assigned by the rendered `SelectRow`
// registration, so application data passed through `items`/`setItems` naturally
// does not include it.
const controlledItems: GridItem[] = [
  { id: "top-left", value: "Top Left" },
  { id: "top-center", value: "Top Center" },
  { id: "top-right", value: "Top Right" },
];

export default function Example() {
  const [items] = useState(controlledItems);
  const [value, setValue] = useState("");
  const select = Ariakit.useSelectStore({ items, value, setValue });
  const firstId = items[0]?.id;
  const lookupRowId = Ariakit.useStoreState(select, () =>
    String(firstId ? (select.item(firstId)?.rowId ?? "missing") : "missing"),
  );
  const stateRowId = Ariakit.useStoreState(select, (state) =>
    String(state.items[0]?.rowId ?? "missing"),
  );

  return (
    <>
      <Ariakit.SelectLabel store={select}>Grid fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} showOnKeyDown={false} />
      <Ariakit.SelectPopover store={select} role="grid">
        <Ariakit.SelectRow>
          {items.map((item) => (
            <Ariakit.SelectItem
              key={item.id}
              id={item.id}
              value={item.value}
              role="gridcell"
            />
          ))}
        </Ariakit.SelectRow>
      </Ariakit.SelectPopover>
      <p>
        Value: <output aria-label="Grid value">{value || "None"}</output>
      </p>
      <p>
        State rowId: <output aria-label="Grid state rowId">{stateRowId}</output>
      </p>
      <p>
        Lookup rowId:{" "}
        <output aria-label="Grid lookup rowId">{lookupRowId}</output>
      </p>
    </>
  );
}
