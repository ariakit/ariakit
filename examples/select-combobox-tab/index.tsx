import "./style.css";
// import { startTransition, useState } from "react";
// import * as Ariakit from "@ariakit/react";
import { Select, SelectItem, SelectList } from "./select.tsx";

export default function Example() {
  // const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex w-[240px] flex-col gap-4">
      <Select
        label={<div hidden>Switch branches/tags</div>}
        heading={<div>Switch branches/tags</div>}
        combobox={<input placeholder="Find or create a branch..." />}
      >
        <SelectList>
          <SelectItem value="main" />
          <SelectItem value="v0" />
        </SelectList>
      </Select>
    </div>
  );
}

{
  /* <Ariakit.ComboboxProvider
        setValue={(value) => {
          startTransition(() => {
            setSearchTerm(value);
          });
        }}
      >
        <Ariakit.SelectProvider defaultValue="main">
          <Ariakit.Select className="focusable clickable button button-default" />
          <Ariakit.SelectPopover
            gutter={5}
            shift={-4}
            className="popup elevation-1 popover popover-enter"
          >
            <Ariakit.PopoverHeading className="px-3 pt-2 font-medium opacity-60">
              Switch branches/tags
            </Ariakit.PopoverHeading>
            <Ariakit.Combobox
              placeholder="Find or create a branch..."
              autoSelect
              className="focusable combobox input"
            />
            <Ariakit.TabProvider selectOnMove={false}>
              <Ariakit.TabList className="tablist">
                <Ariakit.Tab
                  render={<div />}
                  className="tab clickable tab-border tab-default"
                >
                  Branches
                </Ariakit.Tab>
                <Ariakit.Tab
                  render={<div />}
                  className="tab clickable tab-border tab-default"
                >
                  Tags
                </Ariakit.Tab>
              </Ariakit.TabList>
              <Ariakit.TabPanel unmountOnHide className="tab-panel">
                <Ariakit.ComboboxList className="combobox-list">
                  <Ariakit.SelectItem
                    value="main"
                    className="option clickable combobox-item"
                    blurOnHoverEnd={false}
                    render={<Ariakit.ComboboxItem />}
                  >
                    <Ariakit.SelectItemCheck />
                    main
                  </Ariakit.SelectItem>
                  <Ariakit.SelectItem
                    value="v0"
                    className="option clickable combobox-item"
                    blurOnHoverEnd={false}
                    render={<Ariakit.ComboboxItem />}
                  >
                    <Ariakit.SelectItemCheck />
                    v0
                  </Ariakit.SelectItem>
                  <Ariakit.SelectItem
                    value="v1"
                    className="option clickable combobox-item"
                    blurOnHoverEnd={false}
                    render={<Ariakit.ComboboxItem />}
                  >
                    <Ariakit.SelectItemCheck />
                    v1
                  </Ariakit.SelectItem>
                </Ariakit.ComboboxList>
              </Ariakit.TabPanel>
              <Ariakit.TabPanel unmountOnHide className="tab-panel">
                <Ariakit.ComboboxList className="combobox-list">
                  <Ariakit.SelectItem
                    value="v1.0.0"
                    className="option clickable combobox-item"
                    blurOnHoverEnd={false}
                    render={<Ariakit.ComboboxItem />}
                  >
                    <Ariakit.SelectItemCheck />
                    v1.0.0
                  </Ariakit.SelectItem>
                  <Ariakit.SelectItem
                    value="v1.1.0"
                    className="option clickable combobox-item"
                    blurOnHoverEnd={false}
                    render={<Ariakit.ComboboxItem />}
                  >
                    <Ariakit.SelectItemCheck />
                    v1.1.0
                  </Ariakit.SelectItem>
                </Ariakit.ComboboxList>
              </Ariakit.TabPanel>
            </Ariakit.TabProvider>
          </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
      </Ariakit.ComboboxProvider> */
}
