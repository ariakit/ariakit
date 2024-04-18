import "./style.css";
import { useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import * as defaultData from "./data.ts";
import { BranchIcon, TagIcon } from "./icons.tsx";
import {
  Select,
  SelectItem,
  SelectList,
  SelectSeparator,
  SelectTab,
  SelectTabList,
  SelectTabPanel,
} from "./select.tsx";

export default function Example() {
  const [data, setData] = useState(defaultData);

  const [tab, setTab] = useState<string | null | undefined>("branches");
  const [value, setValue] = useState("branches/main");
  const [, selectedTab, valueText] = value.match(/^([^/]+)\/(.+)$/) || [];

  const [searchTerm, setSearchTerm] = useState("");

  const values = tab && tab in data ? data[tab as keyof typeof data] : null;

  const matches = useMemo(() => {
    if (!values) return [];
    if (!searchTerm) return values;
    return matchSorter(values, searchTerm);
  }, [values, searchTerm]);

  const Icon = tab === "branches" ? BranchIcon : TagIcon;
  const placeholder =
    tab === "branches" ? "Find or create a branch..." : "Find a tag...";

  return (
    <div className="w-[240px]">
      <Select
        label={<div hidden>Switch branches/tags</div>}
        icon={<Icon className="opacity-70" />}
        text={valueText}
        heading="Switch branches/tags"
        combobox={<input placeholder={placeholder} />}
        tab={tab}
        setTab={setTab}
        defaultTab={selectedTab}
        value={value}
        setValue={setValue}
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
            {tab === "branches"
              ? searchTerm &&
                !matches.includes(searchTerm) && (
                  <>
                    {!!matches.length && <SelectSeparator />}
                    <SelectItem
                      value={`${tab}/${searchTerm}`}
                      setValueOnClick={() => {
                        setData((data) => ({
                          ...data,
                          branches: [...data.branches, searchTerm],
                        }));
                        return true;
                      }}
                      icon={
                        <BranchIcon className="opacity-70 [[data-active-item]>&]:opacity-100" />
                      }
                    >
                      Create branch <strong>{searchTerm}</strong> from{" "}
                      <strong>{valueText}</strong>
                    </SelectItem>
                  </>
                )
              : !matches.length && (
                  <div className="py-6 text-center">No {tab} found</div>
                )}
          </SelectList>
        </SelectTabPanel>
      </Select>
    </div>
  );
}
