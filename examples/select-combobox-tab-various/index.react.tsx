import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import * as defaultData from "../select-combobox-tab/data.ts";
import { BranchIcon, TagIcon } from "../select-combobox-tab/icons.tsx";
import type { SelectProps } from "../select-combobox-tab/select.tsx";
import {
  Select,
  SelectItem,
  SelectList,
  SelectSeparator,
  SelectTab,
  SelectTabList,
  SelectTabPanel,
} from "../select-combobox-tab/select.tsx";
import "./theme.css";

export default function Example() {
  const [data, setData] = useState(defaultData);
  const [tab, setTab] = useState<SelectProps["tab"]>("branches");
  const [value, setValue] = useState("main");
  const [searchValue, setSearchValue] = useState("");
  const values = tab && tab in data ? data[tab as keyof typeof data] : null;

  const matches = useMemo(() => {
    if (!values) return [];
    if (!searchValue) return values;
    return matchSorter(values, searchValue);
  }, [values, searchValue]);

  const TabIcon = tab === "branches" ? BranchIcon : TagIcon;

  const placeholder =
    tab === "branches" ? "Find or create a branch..." : "Find a tag...";

  const addBranch = (value: string) => {
    setData((data) => ({
      ...data,
      branches: [...data.branches, value],
    }));
  };

  const canAddBranch =
    !!searchValue && !matches.includes(searchValue) && tab === "branches";

  const customItem = canAddBranch && (
    <>
      {!!matches.length && <SelectSeparator />}
      <SelectItem
        icon={<BranchIcon />}
        value={searchValue}
        onClick={() => addBranch(searchValue)}
      >
        Create branch <strong>{searchValue}</strong> from{" "}
        <strong>{value}</strong>
      </SelectItem>
    </>
  );

  const empty = !matches.length && (
    <div className="py-6 text-center">No matches found</div>
  );

  return (
    <div className="flex max-w-full flex-wrap justify-center gap-2">
      <Select
        label={<div hidden>Select with manual Tab</div>}
        icon={<TabIcon />}
        heading="Switch branches/tags"
        tab={tab}
        setTab={setTab}
        value={value}
        setValue={setValue}
        selectTabOnMove={false}
      >
        <SelectTabList>
          <SelectTab id="branches">Branches</SelectTab>
          <SelectTab id="tags">Tags</SelectTab>
        </SelectTabList>
        <SelectTabPanel>
          <SelectList>
            {values?.map((value) => (
              <SelectItem key={value} value={value} />
            ))}
          </SelectList>
        </SelectTabPanel>
      </Select>

      <Select
        label={<div hidden>Select with Combobox and manual Tab</div>}
        icon={<TabIcon />}
        combobox={<input placeholder={placeholder} />}
        tab={tab}
        setTab={setTab}
        value={value}
        setValue={setValue}
        onSearch={setSearchValue}
        selectTabOnMove={false}
      >
        <SelectTabList>
          <SelectTab id="branches">Branches</SelectTab>
          <SelectTab id="tags">Tags</SelectTab>
        </SelectTabList>
        <SelectTabPanel>
          <SelectList>
            {matches.map((value) => (
              <SelectItem key={value} value={value} />
            ))}
            {customItem || empty}
          </SelectList>
        </SelectTabPanel>
      </Select>
    </div>
  );
}
