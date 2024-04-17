import "./style.css";
import { useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import * as data from "./data.ts";
import {
  Select,
  SelectItem,
  SelectList,
  SelectTab,
  SelectTabList,
  SelectTabPanel,
} from "./select.tsx";

export default function Example() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<string | null | undefined>("branches");
  const [value, setValue] = useState("branches/main");
  const [, selectedTab, text] = value.match(/^([^/]+)\/(.+)$/) || [];

  const items =
    tab && Object.hasOwn(data, tab) ? data[tab as keyof typeof data] : null;

  const matches = useMemo(() => {
    if (!items) return [];
    if (!searchTerm) return items;
    return matchSorter(items, searchTerm);
  }, [searchTerm, items]);

  return (
    <div className="w-[240px]">
      <Select
        label={<div hidden>Switch branches/tags</div>}
        text={text}
        heading="Switch branches/tags"
        combobox={<input placeholder="Find or create a branch..." />}
        value={value}
        setValue={setValue}
        defaultTab={selectedTab}
        tab={tab}
        setTab={setTab}
        onSearch={setSearchTerm}
      >
        <SelectTabList>
          <SelectTab id="branches">Branches</SelectTab>
          <SelectTab id="tags">Tags</SelectTab>
        </SelectTabList>
        <SelectTabPanel>
          <SelectList>
            {matches.map((text) => (
              <SelectItem key={text} value={`${tab}/${text}`}>
                {text}
              </SelectItem>
            ))}
            {searchTerm && (
              <SelectItem>
                Create branch <strong>{searchTerm}</strong> from{" "}
                <strong>{text}</strong>
              </SelectItem>
            )}
          </SelectList>
        </SelectTabPanel>
      </Select>
    </div>
  );
}
