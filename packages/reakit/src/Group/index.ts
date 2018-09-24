import Group from "./Group";
import GroupItem from "./GroupItem";

export * from "./Group";
export * from "./GroupItem";

export default Object.assign(Group, {
  Item: GroupItem
});
