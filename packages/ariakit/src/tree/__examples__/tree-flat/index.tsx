import { Tree, useTreeState } from "ariakit/tree";
import { TreeItem } from "./TreeItem";
import "./style.css";

export default function TreeView() {
  const tree = useTreeState({ defaultExpandedIds: ["item-2-2"] });
  return (
    <Tree state={tree}>
      <TreeItem id="item-1">Item 1</TreeItem>
      <TreeItem groupId="item-1">Item 1.1</TreeItem>
      <TreeItem groupId="item-1">Item 1.2</TreeItem>
      <TreeItem groupId="item-1">Item 1.3</TreeItem>
      <TreeItem id="item-2">Item 2</TreeItem>
      <TreeItem groupId="item-2">Item 2.1</TreeItem>
      <TreeItem groupId="item-2" id="item-2-2">
        Item 2.2
      </TreeItem>
      <TreeItem groupId="item-2-2">Item 2.2.1</TreeItem>
      <TreeItem groupId="item-2-2">Item 2.2.2</TreeItem>
      <TreeItem groupId="item-2-2">Item 2.2.3</TreeItem>
      <TreeItem groupId="item-2">Item 2.3</TreeItem>
    </Tree>
  );
}
