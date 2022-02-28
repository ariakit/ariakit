import { Tree, TreeGroup, TreeItem, useTreeState } from "ariakit/tree";
import { TreeGroupLabel } from "./TreeGroupLabel";
import "./style.css";

export default function TreeView() {
  const tree = useTreeState({ defaultExpandedIds: ["item-2"] });
  return (
    <Tree state={tree} aria-label="Items">
      <TreeItem>Item 1</TreeItem>
      <TreeItem id="item-2">
        <TreeGroupLabel>Item 2</TreeGroupLabel>
        <TreeGroup>
          <TreeItem>Item 2.1</TreeItem>
          <TreeItem>Item 2.2</TreeItem>
          <TreeItem>Item 2.3</TreeItem>
          <TreeItem>
            <TreeGroupLabel>Item 2.4</TreeGroupLabel>
            <TreeGroup>
              <TreeItem>Item 2.4.1</TreeItem>
              <TreeItem>Item 2.4.2</TreeItem>
              <TreeItem>Item 2.4.3</TreeItem>
            </TreeGroup>
          </TreeItem>
        </TreeGroup>
      </TreeItem>
      <TreeItem>Item 3</TreeItem>
      <TreeItem>Item 4</TreeItem>
    </Tree>
  );
}
