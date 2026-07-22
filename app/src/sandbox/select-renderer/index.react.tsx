import * as Ariakit from "@ariakit/react";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import type { SelectRendererItem } from "@ariakit/react-components/select/select-renderer";
import type { SelectRendererItemObject } from "@ariakit/react-components/select/select-renderer";
import { useState } from "react";
import "./style.css";

interface FruitItem extends SelectRendererItemObject {
  id: string;
  label?: string;
  items?: FruitItem[];
}

function getItem(value: string): FruitItem {
  return { id: `item-${value.toLowerCase()}`, value };
}

const citrusItems = ["Lemon", "Lime", "Orange"].map(getItem);
const otherItems = ["Apple", "Banana"].map(getItem);

const items: readonly FruitItem[] = [
  {
    id: "group-citrus",
    label: "Citrus",
    itemSize: 40,
    paddingStart: 44,
    items: citrusItems,
  },
  ...otherItems,
];

const defaultItems = [...citrusItems, ...otherItems];

const horizontalItems = [
  { id: "apple", value: "apple", label: "Apple" },
  { id: "banana", value: "banana", label: "Banana" },
  { id: "cherry", value: "cherry", label: "Cherry" },
] satisfies readonly SelectRendererItem[];

const asyncItems = Array.from({ length: 100 }, (_, index) => ({
  id: `async-item-${index + 1}`,
  value: `Async item ${index + 1}`,
}));

function GroupedRenderer() {
  const select = Ariakit.useSelectStore({ defaultItems, defaultValue: "" });

  return (
    <>
      <Ariakit.SelectLabel store={select}>Fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} />
      <Ariakit.SelectPopover
        store={select}
        gutter={4}
        sameWidth
        style={{ background: "white", border: "1px solid gray" }}
      >
        <SelectRenderer
          store={select}
          items={items}
          initialItems={items.length}
          persistentIndices={[1]}
        >
          {(item) => {
            if (item.items) {
              const { label, ...groupProps } = item;
              return (
                <SelectRenderer
                  key={groupProps.id}
                  {...groupProps}
                  initialItems={item.items.length}
                  render={(props) => (
                    <Ariakit.SelectGroup {...props}>
                      <Ariakit.SelectGroupLabel>
                        {label}
                      </Ariakit.SelectGroupLabel>
                      {props.children}
                    </Ariakit.SelectGroup>
                  )}
                >
                  {({ value, ...optionProps }) => (
                    <Ariakit.SelectItem
                      key={optionProps.id}
                      value={value}
                      {...optionProps}
                    />
                  )}
                </SelectRenderer>
              );
            }
            const { value, ...optionProps } = item;
            return (
              <Ariakit.SelectItem
                key={optionProps.id}
                value={value}
                {...optionProps}
              />
            );
          }}
        </SelectRenderer>
      </Ariakit.SelectPopover>
    </>
  );
}

function HorizontalRenderer() {
  const select = Ariakit.useSelectStore({ defaultValue: "apple" });

  return (
    <Ariakit.SelectProvider store={select}>
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} className="popover">
        <SelectRenderer
          orientation="horizontal"
          items={horizontalItems}
          initialItems={horizontalItems.length}
          itemSize={96}
          className="renderer"
        >
          {({ value, label, ...item }) => (
            <Ariakit.SelectItem
              key={item.id}
              value={value}
              {...item}
              className="option"
            >
              {label}
            </Ariakit.SelectItem>
          )}
        </SelectRenderer>
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

function AsyncRenderer() {
  const [items, setItems] = useState<typeof asyncItems>([]);
  const [scrollObserved, setScrollObserved] = useState(false);

  return (
    <section>
      <button type="button" onClick={() => setItems(asyncItems)}>
        Load async items
      </button>
      <p role="status">Scroll observed: {scrollObserved ? "yes" : "no"}</p>
      <div className="async-scroller" role="listbox" aria-label="Async items">
        <SelectRenderer
          key={items.length ? "loaded" : "empty"}
          items={items}
          itemSize={40}
          renderOnScroll={() => {
            setScrollObserved(true);
            return true;
          }}
        >
          {({ value, index, ...item }) => (
            <div key={item.id} {...item} data-index={index} role="option">
              {value}
            </div>
          )}
        </SelectRenderer>
      </div>
    </section>
  );
}

export default function Example() {
  return (
    <>
      <GroupedRenderer />
      <HorizontalRenderer />
      <AsyncRenderer />
    </>
  );
}
