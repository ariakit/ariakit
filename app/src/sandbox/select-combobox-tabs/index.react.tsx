import * as Ariakit from "@ariakit/react";
import { startTransition, useState } from "react";

const branches = ["main", "0.10-stable", "fabric-focus-blur", "gh-pages"];
const tags = ["v18.2.0", "v18.1.0", "v18.0.0"];

interface TabbedSelectProps {
  label: string;
  manual?: boolean;
}

function TabbedSelect({ label, manual }: TabbedSelectProps) {
  const [searchValue, setSearchValue] = useState("");
  const [tab, setTab] = useState<"branches" | "tags">("branches");
  const values = tab === "branches" ? branches : tags;
  const matches = values.filter((value) =>
    value.toLowerCase().includes(searchValue.toLowerCase()),
  );
  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => setSearchValue(value));
      }}
    >
      <Ariakit.SelectProvider virtualFocus defaultValue="main">
        <Ariakit.SelectLabel>{label}</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} unmountOnHide>
          <Ariakit.Combobox autoSelect placeholder="Find a branch or tag" />
          <Ariakit.TabProvider
            selectedId={tab}
            setSelectedId={(id) => {
              if (id === "branches" || id === "tags") {
                setTab(id);
              }
            }}
            selectOnMove={!manual}
          >
            <Ariakit.TabList>
              <Ariakit.Tab id="branches">Branches</Ariakit.Tab>
              <Ariakit.Tab id="tags">Tags</Ariakit.Tab>
            </Ariakit.TabList>
            <Ariakit.TabPanel tabId={tab}>
              <Ariakit.ComboboxList>
                {matches.map((value) => (
                  <Ariakit.SelectItem
                    key={value}
                    value={value}
                    render={<Ariakit.ComboboxItem />}
                  />
                ))}
              </Ariakit.ComboboxList>
            </Ariakit.TabPanel>
          </Ariakit.TabProvider>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <main className="grid gap-8">
      <TabbedSelect label="Automatic tabs" />
      <TabbedSelect label="Manual tabs" manual />
    </main>
  );
}
