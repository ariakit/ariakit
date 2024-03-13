import "./style.css";
import { useDeferredValue, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { Tag } from "@ariakit/react-core/tag/tag";
import { TagInput } from "@ariakit/react-core/tag/tag-input";
import { TagList } from "@ariakit/react-core/tag/tag-list";
import { TagProvider } from "@ariakit/react-core/tag/tag-provider";
import { TagRemove } from "@ariakit/react-core/tag/tag-remove";
import { TagToggle } from "@ariakit/react-core/tag/tag-toggle";
import { matchSorter } from "match-sorter";
import defaultList from "./list.js";

export default function Example() {
  const [list, _setList] = useState(defaultList);
  const [values, setValues] = useState(["Paragraph", "Table"]);
  const [value, setValue] = useState("");
  const searchTerm = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(list, searchTerm),
    [list, searchTerm],
  );

  return (
    <TagProvider
      values={values}
      setValues={setValues}
      value={value}
      setValue={setValue}
    >
      <TagList className="tag-list">
        {values.map((value) => (
          <Tag key={value} value={value} className="tag">
            {value}
            <TagRemove className="tag-remove" />
          </Tag>
        ))}
        <Ariakit.ComboboxProvider
          selectedValue={values}
          setSelectedValue={setValues}
        >
          <TagInput
            className="tag-input"
            render={<Ariakit.Combobox autoSelect />}
          />
          <Ariakit.ComboboxPopover className="popover">
            {matches.map((value) => (
              <TagToggle
                key={value}
                value={value}
                className="combobox-item"
                render={<Ariakit.ComboboxItem value={value} />}
              >
                <Ariakit.ComboboxItemCheck />
                {value}
              </TagToggle>
            ))}
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
      </TagList>
    </TagProvider>
  );
}
