import * as Ariakit from "@ariakit/react";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import type { SelectRendererItemObject } from "@ariakit/react-components/select/select-renderer";

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

export default function Example() {
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
        <SelectRenderer store={select} items={items}>
          {(item) => {
            if (item.items) {
              const { label, ...groupProps } = item;
              return (
                <SelectRenderer
                  key={groupProps.id}
                  {...groupProps}
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
