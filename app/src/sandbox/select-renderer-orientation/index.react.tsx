import * as Ariakit from "@ariakit/react";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import type { SelectRendererItem } from "@ariakit/react-components/select/select-renderer";
import "./style.css";

const items = [
  { id: "apple", value: "apple", label: "Apple" },
  { id: "banana", value: "banana", label: "Banana" },
  { id: "cherry", value: "cherry", label: "Cherry" },
] satisfies readonly SelectRendererItem[];

export default function Example() {
  const select = Ariakit.useSelectStore({ defaultValue: "apple" });

  return (
    <Ariakit.SelectProvider store={select}>
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} className="popover">
        <SelectRenderer
          orientation="horizontal"
          items={items}
          initialItems={items.length}
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
