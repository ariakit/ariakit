import "./style.css";
import { startTransition, useMemo, useState } from "react";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import { actions } from "./actions.js";
import { Menu, MenuGroup, MenuItem, MenuSeparator } from "./menu.jsx";

function flattenItems(
  items: Array<{ label: string; items?: typeof items }>,
): Array<{ label: string; group?: string }> {
  return items.flatMap((item) => {
    if (item.items) {
      return flattenItems(item.items.map((i) => ({ ...i, group: item.label })));
    }
    return item;
  });
}

export default function Example() {
  const [values, setValues] = useState<Record<string, string>>({
    "Turn into": "Text",
    Color: "Default",
    Background: "Default background",
  });

  // TODO: Move this logic into menu.tsx
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    if (!searchValue) return;
    const items = flattenItems(Object.values(actions));
    const matches = matchSorter(items, searchValue, {
      keys: ["label", "group"],
    });
    return Object.entries(groupBy(matches, "group"));
  }, [searchValue]);

  const defaultItems = (
    <>
      <MenuItem>{actions.askAi.label}</MenuItem>
      <MenuItem>{actions.delete.label}</MenuItem>
      <MenuItem>{actions.duplicate.label}</MenuItem>
      <Menu label={actions.turnInto.label}>
        {actions.turnInto.items.map((item) => (
          <MenuItem
            key={item.label}
            name={actions.turnInto.label}
            value={item.label}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        label={actions.turnIntoPageIn.label}
        combobox={<input placeholder="Search pages to add in..." />}
      >
        {actions.turnIntoPageIn.items.map((item) => (
          <MenuItem key={item.label} value={item.label}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      <MenuSeparator />
      <MenuItem>{actions.copyLinkToBlock.label}</MenuItem>
      <MenuItem>{actions.moveTo.label}</MenuItem>
      <MenuItem>{actions.comment.label}</MenuItem>
      <Menu label={actions.color.label}>
        {actions.color.items.map((group) => (
          <MenuGroup key={group.label} label={group.label}>
            {group.items.map((item) => (
              <MenuItem key={item.label} name={group.label} value={item.label}>
                {item.label}
              </MenuItem>
            ))}
          </MenuGroup>
        ))}
      </Menu>
    </>
  );

  const matchItems = matches?.map(([group, items]) => {
    const renderedItems = items.map((item) => (
      <MenuItem key={item.label} name={item.group} value={item.label}>
        {item.label}
      </MenuItem>
    ));
    if (group === "undefined") return renderedItems;
    return (
      <MenuGroup key={group} label={group}>
        {renderedItems}
      </MenuGroup>
    );
  });

  return (
    <Menu
      label="Actions"
      values={values}
      onValuesChange={setValues}
      onSearch={(value) => startTransition(() => setSearchValue(value))}
      combobox={<input placeholder="Search actions..." />}
      trigger={<button>Actions</button>}
    >
      {matchItems || defaultItems}
    </Menu>
  );
}
