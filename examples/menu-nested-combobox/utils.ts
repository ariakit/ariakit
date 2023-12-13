import type { Action } from "./actions.js";
import type { MenuOption } from "./menu.jsx";

export function actionsToOptions(
  items: Array<Action & MenuOption>,
): MenuOption[] {
  return items.flatMap((item) => {
    if (item.items) {
      const group =
        item.label === "Suggested" ? item.group || item.label : item.label;
      return actionsToOptions(item.items.map((item) => ({ ...item, group })));
    }
    return item;
  });
}

export function optionsToActions(options: MenuOption[] | null) {
  if (!options) return null;
  return options.reduce<Action[]>((actions, option) => {
    if (option.group) {
      const group = actions.find((action) => action.label === option.group);
      if (group) {
        if (!group.items) {
          group.items = [];
        }
        group.items.push(option);
      } else {
        actions.push({ label: option.group, items: [option] });
      }
    } else {
      actions.push(option);
    }
    return actions;
  }, []);
}
