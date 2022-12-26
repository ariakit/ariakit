import * as Ariakit from "@ariakit/react";
import { bold, italic, redo, underline, undo } from "./icons";
import "./style.css";

export default function Example() {
  const toolbar = Ariakit.useToolbarStore();
  return (
    <Ariakit.Toolbar store={toolbar} className="toolbar">
      <Ariakit.ToolbarItem className="button">
        {undo}
        Undo
      </Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem className="button" disabled>
        {redo}
        Redo
      </Ariakit.ToolbarItem>
      <Ariakit.ToolbarSeparator className="separator" />
      <Ariakit.ToolbarItem className="button">
        {bold}
        Bold
      </Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem className="button">
        {italic}
        Italic
      </Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem className="button">
        {underline}
        Underline
      </Ariakit.ToolbarItem>
    </Ariakit.Toolbar>
  );
}
