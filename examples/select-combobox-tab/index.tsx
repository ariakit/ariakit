import "./style.css";
import { useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import * as data from "./data.ts";
import { BranchIcon, TagIcon } from "./icons.tsx";
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
        text={
          <>
            {tab === "branches" ? (
              <BranchIcon className="opacity-70" />
            ) : (
              <TagIcon className="opacity-70" />
            )}
            {text}
          </>
        }
        heading="Switch branches/tags"
        combobox={
          <input
            placeholder={
              tab === "branches"
                ? "Find or create a branch..."
                : "Find a tag..."
            }
          />
        }
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
            {!!matches.length && searchTerm && (
              <div className="popup-cover my-1 h-px bg-[--border] p-0" />
            )}
            {searchTerm && (
              <SelectItem icon={<BranchIcon className="opacity-70" />}>
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
