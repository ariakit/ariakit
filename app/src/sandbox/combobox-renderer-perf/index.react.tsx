import * as Ariakit from "@ariakit/react";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import { startTransition, useMemo, useState } from "react";
import "./style.css";

interface Option {
  id: string;
  value: string;
  height: number;
}

function getItems(count: number): Option[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `option-${index + 1}`,
    value:
      index + 1 === count * 0.8 ? `Target ${index + 1}` : `Item ${index + 1}`,
    // The first window underestimates the sizes near the end. Keep sizes out of
    // item.style so the measured variant must read the rendered elements.
    height: index < 12 ? 24 : 72,
  }));
}

interface BenchmarkProps {
  count: number;
  mode: string;
  searchable: boolean;
}

function Benchmark({ count, mode, searchable }: BenchmarkProps) {
  const items = useMemo(() => getItems(count), [count]);
  const [search, setSearch] = useState("");
  const matches = useMemo(() => {
    const query = search.toLowerCase();
    return items.filter((item) => item.value.toLowerCase().includes(query));
  }, [items, search]);
  const groups = useMemo(() => {
    if (mode !== "grouped") return [];
    const result = [];
    for (let index = 0; index < matches.length; index += 50) {
      result.push({
        id: `group-${index / 50}`,
        items: matches.slice(index, index + 50),
      });
    }
    return result;
  }, [matches, mode]);
  const fixed = mode === "fixed";

  return (
    <Ariakit.ComboboxProvider
      defaultItems={items}
      defaultSelectedValue="Item 1"
      resetValueOnHide
      setValue={(value) => startTransition(() => setSearch(value))}
    >
      <Ariakit.ComboboxSelectLabel>Choice</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect className="renderer-trigger" />
      <Ariakit.ComboboxPopover
        className="renderer-popover"
        gutter={4}
        unmountOnHide
      >
        {searchable && (
          <Ariakit.ComboboxInput
            aria-label="Search items"
            autoSelect
            className="renderer-search"
          />
        )}
        <output aria-label="Matching items">{matches.length}</output>
        <Ariakit.ComboboxList className="renderer-list" aria-label="Choices">
          {mode === "grouped" ? (
            <ComboboxRenderer items={groups} overscan={1}>
              {(group) => (
                <ComboboxRenderer
                  key={group.id}
                  {...group}
                  overscan={1}
                  render={<Ariakit.ComboboxGroup />}
                >
                  {({ height, ...item }) => (
                    <Ariakit.ComboboxItem
                      key={item.id}
                      {...item}
                      className="renderer-option"
                      style={{ ...item.style, height }}
                    />
                  )}
                </ComboboxRenderer>
              )}
            </ComboboxRenderer>
          ) : (
            <ComboboxRenderer
              items={matches}
              itemSize={fixed ? 32 : undefined}
              overscan={1}
            >
              {({ height, ...item }) => (
                <Ariakit.ComboboxItem
                  key={item.id}
                  {...item}
                  className="renderer-option"
                  style={{ ...item.style, height: fixed ? 32 : height }}
                />
              )}
            </ComboboxRenderer>
          )}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  const [count, setCount] = useState(1000);
  const [mode, setMode] = useState("measured");
  const [searchable, setSearchable] = useState(false);
  return (
    <main className="combobox-renderer-benchmark">
      <h1>Combobox renderer</h1>
      <label>
        Item count
        <select
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
        >
          <option value={1000}>1,000</option>
          <option value={10000}>10,000</option>
        </select>
      </label>
      <label>
        Layout
        <select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="fixed">Flat, fixed sizes</option>
          <option value="measured">Flat, measured sizes</option>
          <option value="grouped">Grouped, measured sizes</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={searchable}
          onChange={(event) => setSearchable(event.target.checked)}
        />
        Searchable
      </label>
      <Benchmark
        key={`${count}-${mode}-${searchable}`}
        count={count}
        mode={mode}
        searchable={searchable}
      />
    </main>
  );
}
