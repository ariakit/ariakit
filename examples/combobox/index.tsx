import * as Ariakit from "@ariakit/react";
import { ComboboxItem } from "@ariakit/react-core/combobox/combobox-item-offscreen";
// import { CompositeItem } from "@ariakit/react-core/composite/composite-item-offscreen";
import { CompositeRenderer } from "@ariakit/react-core/composite/composite-renderer";
import { SelectItem } from "@ariakit/react-core/select/select-item-offscreen";
// import {
//   Combobox,
//   ComboboxInput,
//   ComboboxOption,
//   ComboboxOptions,
// } from "@headlessui/react";
import { useState } from "react";
import {
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import "./style.css";
import { SelectRenderer } from "@ariakit/react-core/select/select-renderer";

const items = Array.from({ length: 1000 }).map((_, index) => ({
  id: `item-${index}`,
  value: `${String.fromCharCode(65 + (index % 26))} item ${index}`,
}));

export default function Example() {
  const [offscreen, setOffscreen] = useState(false);
  const [renderer, setRenderer] = useState(false);
  const ComboboxComponent = offscreen ? ComboboxItem : Ariakit.ComboboxItem;
  const SelectComponent = offscreen ? SelectItem : Ariakit.SelectItem;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <button onClick={() => setOffscreen(!offscreen)}>
          Turn {offscreen ? "off" : "on"} offscreen
        </button>
        <button onClick={() => setRenderer(!renderer)}>
          Turn {renderer ? "off" : "on"} renderer
        </button>
      </div>
      <Ariakit.ComboboxProvider focusLoop={false}>
        <Ariakit.ComboboxLabel className="label">
          Your favorite fruit
        </Ariakit.ComboboxLabel>
        <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
        <Ariakit.ComboboxPopover
          gutter={4}
          sameWidth
          unmountOnHide
          className="popover"
        >
          {renderer && (
            <CompositeRenderer items={1000} itemSize={40}>
              {(item) => (
                <Ariakit.ComboboxItem
                  key={item.index}
                  className="combobox-item"
                  value={`Item ${item.id}`}
                  {...item}
                />
              )}
            </CompositeRenderer>
          )}
          {!renderer &&
            Array.from({ length: 1000 }).map((_, index) => (
              <ComboboxComponent
                offscreenBehavior={offscreen ? "lazy" : undefined}
                key={index}
                className="combobox-item"
                value={`Item ${index}`}
              />
            ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <Ariakit.SelectProvider
        defaultValue="G item 110"
        focusLoop={false}
        defaultItems={items}
        // virtualFocus={false}
      >
        <Ariakit.Select />
        <Ariakit.SelectPopover unmountOnHide sameWidth className="popover">
          {renderer && (
            <SelectRenderer itemSize={40}>
              {(item) => (
                <Ariakit.SelectItem
                  key={item.index}
                  className="combobox-item"
                  {...item}
                />
              )}
            </SelectRenderer>
          )}
          {!renderer &&
            items.map((item, index) => (
              <SelectComponent
                offscreenBehavior={offscreen ? "lazy" : undefined}
                key={index}
                className="combobox-item"
                {...item}
              />
            ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
      <Select>
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue />
          <span aria-hidden="true">▼</span>
        </Button>
        <Popover className="popover">
          <ListBox>
            {Array.from({ length: 1000 }).map((_, index) => (
              <ListBoxItem key={index} textValue={`Item ${index}`}>
                Item {index}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
      </Select>
      <ComboBox>
        <Label>Favorite Animal</Label>
        <div>
          <Input />
          <Button>▼</Button>
        </div>
        <Popover className="popover">
          <ListBox>
            {Array.from({ length: 1000 }).map((_, index) => (
              <ListBoxItem key={index} textValue={`Item ${index}`}>
                Item {index}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
      </ComboBox>
      {/* <Combobox>
        <ComboboxInput aria-label="Assignee" />
        <ComboboxOptions anchor="bottom" className="border empty:invisible">
          {Array.from({ length: 1000 }).map((_, index) => (
            <ComboboxOption
              key={index}
              className="combobox-item"
              value={`Item ${index}`}
            >
              Item {index}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox> */}
      {/* <Ariakit.CompositeProvider>
        <Ariakit.Composite
          ref={ref}
          role="listbox"
          className="w-[400px] max-h-80 overflow-auto flex flex-col p-2"
        >
          {Array.from({ length: 2000 }).map((_, index) => (
            <CompositeItem
              key={index}
              role="option"
              offscreenBehavior={index === 0 ? "active" : "passive"}
              offscreenRoot={ref}
              className="combobox-item"
              render={(props) => {
                if ("data-offscreen" in props) {
                  return <div {...props} />;
                }
                return <Ariakit.CompositeTypeahead {...props} />;
              }}
            >
              {String.fromCharCode(65 + (index % 26))} item {index}
            </CompositeItem>
          ))}
        </Ariakit.Composite>
      </Ariakit.CompositeProvider> */}
    </div>
  );
}
