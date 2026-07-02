import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const PAGE_SIZE = 5;
const TOTAL_ITEMS = 50;
const PAGE_COUNT = TOTAL_ITEMS / PAGE_SIZE;

const allItems = Array.from(
  { length: TOTAL_ITEMS },
  (_, index) => `Item ${index + 1}`,
);

function getPageItems(pageNumber: number) {
  const start = (pageNumber - 1) * PAGE_SIZE;
  return allItems.slice(start, start + PAGE_SIZE);
}

export default function Example() {
  const composite = Ariakit.useCompositeStore();
  const [pageInput, setPageInput] = useState("1");
  const [items, setItems] = useState(() => getPageItems(1));
  // NaN while the field is empty (a transient state when the user clears the
  // field to type another page number)
  const page = Number.parseInt(pageInput, 10);
  return (
    <div className="flex flex-col items-start gap-3">
      <label className="flex items-center gap-2">
        Page
        <input
          type="number"
          min={1}
          max={PAGE_COUNT}
          value={pageInput}
          className="w-16 rounded border border-gray-400 px-2 py-1"
          onChange={(event) => {
            const { value } = event.target;
            setPageInput(value);
            const nextPage = Number.parseInt(value, 10);
            if (nextPage >= 1 && nextPage <= PAGE_COUNT) {
              setItems(getPageItems(nextPage));
            }
          }}
        />
      </label>
      <Ariakit.Composite store={composite} role="listbox" aria-label="Results">
        {items.map((item, index) => (
          <Ariakit.CompositeItem
            key={item}
            role="option"
            aria-setsize={TOTAL_ITEMS}
            aria-posinset={(page - 1) * PAGE_SIZE + index + 1}
          >
            {item}
          </Ariakit.CompositeItem>
        ))}
      </Ariakit.Composite>
    </div>
  );
}
