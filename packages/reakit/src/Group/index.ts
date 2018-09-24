import Group from "./Group";
import GroupItem from "./GroupItem";

interface GroupComponents {
  Item: typeof GroupItem;
}

const G = Group as typeof Group & GroupComponents;

G.Item = GroupItem;

export * from "./Group";
export * from "./GroupItem";

export default G;
