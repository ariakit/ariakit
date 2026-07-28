import * as Ariakit from "@ariakit/react";
import { startTransition, useState } from "react";
import { branches, tags } from "./data.ts";

interface TabbedSelectProps {
  label: string;
  manual?: boolean;
  searchable?: boolean;
}

interface TabData {
  branches: string[];
  tags: string[];
}

function TabbedSelect({ label, manual, searchable }: TabbedSelectProps) {
  const [data, setData] = useState<TabData>({
    branches: [...branches],
    tags: [...tags],
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedValue, setSelectedValue] = useState("main");
  const [tab, setTab] = useState<"branches" | "tags">("branches");
  const values = data[tab];
  const matches = values.filter((value) =>
    value.toLowerCase().includes(searchValue.toLowerCase()),
  );
  const canCreateBranch =
    searchable &&
    tab === "branches" &&
    !!searchValue &&
    !matches.includes(searchValue);
  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide={searchable}
      selectedValue={selectedValue}
      setSelectedValue={setSelectedValue}
      virtualFocus={searchable}
      setValue={(value) => {
        startTransition(() => setSearchValue(value));
      }}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover
        gutter={4}
        unmountOnHide
        className="ak-popup ak-popup-enter ak-elevation-1 ak-popover z-50 flex max-h-80 flex-col overflow-clip"
      >
        {searchable && (
          <Ariakit.Combobox autoSelect placeholder="Find a branch or tag" />
        )}
        <Ariakit.TabProvider
          selectedId={tab}
          setSelectedId={(id) => {
            if (id === "branches" || id === "tags") {
              setTab(id);
            }
          }}
          selectOnMove={!manual}
        >
          <Ariakit.TabList className="ak-tab-list ak-tab-border ak-popup-cover flex flex-none overflow-x-auto">
            <Ariakit.Tab id="branches">Branches</Ariakit.Tab>
            <Ariakit.Tab id="tags">Tags</Ariakit.Tab>
          </Ariakit.TabList>
          <Ariakit.TabPanel
            key={tab}
            tabId={tab}
            className="ak-tab-panel ak-popup-layer ak-popup-cover flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <Ariakit.ComboboxList className="ak-popup-cover ak-popup-scroll min-h-0 flex-1 overflow-auto overscroll-contain outline-none">
              {matches.map((value) => (
                <Ariakit.ComboboxItem
                  key={value}
                  value={value}
                  autoFocus={value === selectedValue}
                  className="ak-option"
                />
              ))}
              {canCreateBranch && (
                <Ariakit.ComboboxItem
                  value={searchValue}
                  className="ak-option"
                  onClick={() => {
                    setData((data) => ({
                      ...data,
                      branches: [...data.branches, searchValue],
                    }));
                  }}
                >
                  Create branch <strong>{searchValue}</strong> from{" "}
                  <strong>{selectedValue}</strong>
                </Ariakit.ComboboxItem>
              )}
            </Ariakit.ComboboxList>
          </Ariakit.TabPanel>
        </Ariakit.TabProvider>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <main className="grid gap-8">
      <TabbedSelect label="Select with Tab" />
      <TabbedSelect label="Select with Combobox and Tab" searchable />
      <TabbedSelect label="Select with manual Tab" manual />
      <TabbedSelect
        label="Select with Combobox and manual Tab"
        manual
        searchable
      />
    </main>
  );
}
