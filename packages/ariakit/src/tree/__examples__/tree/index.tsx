import {
  Tree,
  TreeGroup,
  TreeGroupLabel,
  TreeItem,
  useTreeState,
} from "ariakit/tree";
import "./style.css";

export default function TreeView() {
  const tree = useTreeState({ defaultExpandedIds: ["item-1"] });
  return (
    <Tree state={tree} aria-label="Items">
      <TreeItem id="item-1">Item 1</TreeItem>
      <TreeItem>Item 2</TreeItem>
      <TreeItem>Item 3</TreeItem>
      <TreeItem>
        <TreeGroupLabel id="item-4">Item 4</TreeGroupLabel>
        <TreeGroup id="group-4">
          <TreeItem>Item 4.1</TreeItem>
          <TreeItem>Item 4.2</TreeItem>
          <TreeItem>Item 4.3</TreeItem>
          <TreeItem>
            <TreeGroupLabel>Item 4.4</TreeGroupLabel>
            <TreeGroup>
              <TreeItem>Item 4.4.1</TreeItem>
              <TreeItem>Item 4.4.2</TreeItem>
              <TreeItem>Item 4.4.3</TreeItem>
            </TreeGroup>
          </TreeItem>
        </TreeGroup>
      </TreeItem>
      <TreeItem>Item 5</TreeItem>
      <TreeItem>Item 6</TreeItem>
    </Tree>
  );
}
