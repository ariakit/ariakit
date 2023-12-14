import { matchSorter } from "match-sorter";
import type { Action } from "./actions.js";

export function filterActions(
  actions: Action[],
  searchValue: string,
): Action[] | null {
  if (!searchValue) return null;
  const options = flattenActions(actions);
  const matches = matchSorter(options, searchValue, {
    keys: ["label", "group", "value"],
  });
  return nestActions(matches.slice(0, 15));
}

export function flattenActions(actions: Action[]): Action[] {
  return actions.flatMap((item) => {
    if (item.items) {
      const group =
        item.label === "Suggested" ? item.group || item.label : item.label;
      return flattenActions(item.items.map((item) => ({ ...item, group })));
    }
    return item;
  });
}

export function nestActions(actions: Action[] | null) {
  if (!actions) return null;
  return actions.reduce<Action[]>((actions, option) => {
    if (option.group) {
      const group = actions.find((action) => action.label === option.group);
      if (group) {
        group.items!.push(option);
      } else {
        actions.push({ label: option.group, items: [option] });
      }
    } else {
      actions.push(option);
    }
    return actions;
  }, []);
}
