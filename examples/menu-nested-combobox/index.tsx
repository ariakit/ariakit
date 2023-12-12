import "./style.css";
import { useState } from "react";
import { actions, defaultValues } from "./actions.js";
import type { Action } from "./actions.js";
import { Menu, MenuGroup, MenuItem, MenuSeparator } from "./menu.jsx";
import { actionsToOptions, optionsToActions } from "./utils.js";

const options = actionsToOptions(Object.values(actions));
const pageOptions = actionsToOptions(actions.turnIntoPageIn.items);

export default function Example() {
  const [values, setValues] = useState(defaultValues);
  const [matches, setMatches] = useState<Action[] | null>(null);
  const [pageMatches, setPageMatches] = useState<Action[] | null>(null);

  const renderItems = (items: Action[], group?: string) => {
    return items.map((item) => {
      if (item.items) {
        return (
          <MenuGroup key={item.label} label={item.label}>
            {renderItems(item.items, item.label)}
          </MenuGroup>
        );
      }
      return (
        <MenuItem key={item.label} name={group} value={item.label}>
          {item.label}
        </MenuItem>
      );
    });
  };

  const renderMatches = (matches: Action[] | null) => {
    if (!matches) return null;
    if (!matches.length) {
      return <div className="no-results">No results</div>;
    }
    return renderItems(matches);
  };

  const defaultItems = (
    <>
      <MenuItem>{actions.askAi.label}</MenuItem>
      <MenuItem>{actions.delete.label}</MenuItem>
      <MenuItem>{actions.duplicate.label}</MenuItem>
      <Menu label={actions.turnInto.label}>
        {renderItems(actions.turnInto.items, actions.turnInto.label)}
      </Menu>
      <Menu
        label={actions.turnIntoPageIn.label}
        options={pageOptions}
        onMatch={(options) => setPageMatches(optionsToActions(options))}
        combobox={<input placeholder="Search pages to add in..." />}
      >
        {renderMatches(pageMatches) ||
          renderItems(
            actions.turnIntoPageIn.items,
            actions.turnIntoPageIn.label,
          )}
      </Menu>
      <MenuSeparator />
      <MenuItem>{actions.copyLinkToBlock.label}</MenuItem>
      <MenuItem>{actions.moveTo.label}</MenuItem>
      <MenuItem>{actions.comment.label}</MenuItem>
      <Menu label={actions.color.label}>
        {renderItems(actions.color.items, actions.color.label)}
      </Menu>
    </>
  );

  return (
    <Menu
      label="Actions"
      values={values}
      onValuesChange={(values: typeof defaultValues) => setValues(values)}
      options={options}
      onMatch={(options) => setMatches(optionsToActions(options))}
      trigger={<button>Actions</button>}
      combobox={<input placeholder="Search actions..." />}
    >
      {renderMatches(matches) || defaultItems}
    </Menu>
  );
}
