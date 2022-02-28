import { Tree, useTreeState } from "ariakit/tree";
import { TreeItem } from "./TreeItem";
import "./style.css";

export default function TreeView() {
  const tree = useTreeState({ defaultExpandedIds: ["item-2"] });
  return (
    <Tree state={tree}>
      <TreeItem>Item 1</TreeItem>
      <TreeItem id="item-2">Item 2</TreeItem>
      <TreeItem groupId="item-2">Item 2.1</TreeItem>
      <TreeItem groupId="item-2">Item 2.2</TreeItem>
      <TreeItem groupId="item-2">Item 2.3</TreeItem>
      <TreeItem groupId="item-2" id="item-2-4">
        Item 2.4
      </TreeItem>
      <TreeItem groupId="item-2-4">Item 2.4.1</TreeItem>
      <TreeItem groupId="item-2-4">Item 2.4.2</TreeItem>
      <TreeItem groupId="item-2-4">Item 2.4.3</TreeItem>
      <TreeItem>Item 3</TreeItem>
      <TreeItem>Item 4</TreeItem>
    </Tree>
  );
}
