import { Button } from "ariakit/button";
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState,
} from "ariakit/toolbar";
import "./style.css";

export default function Example() {
  const toolbar = useToolbarState();

  return (
    <Toolbar state={toolbar} className="toolbar">
      <ToolbarItem as={Button} className="button">
        File
      </ToolbarItem>
      <ToolbarItem as={Button} className="button">
        Edit
      </ToolbarItem>
      <ToolbarSeparator className="toolbar-separator" />
      <ToolbarItem as={Button} className="button">
        Formats
      </ToolbarItem>
      <ToolbarItem as={Button} className="button">
        Help
      </ToolbarItem>
    </Toolbar>
  );
}
