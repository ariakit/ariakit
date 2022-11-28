import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarStore,
} from "ariakit/toolbar/store";
import { bold, italic, redo, underline, undo } from "./icons";
import "./style.css";

export default function Example() {
  const toolbar = useToolbarStore();
  return (
    <Toolbar store={toolbar} className="toolbar">
      <ToolbarItem className="button">
        {undo}
        Undo
      </ToolbarItem>
      <ToolbarItem className="button" disabled>
        {redo}
        Redo
      </ToolbarItem>
      <ToolbarSeparator className="separator" />
      <ToolbarItem className="button">
        {bold}
        Bold
      </ToolbarItem>
      <ToolbarItem className="button">
        {italic}
        Italic
      </ToolbarItem>
      <ToolbarItem className="button">
        {underline}
        Underline
      </ToolbarItem>
    </Toolbar>
  );
}
