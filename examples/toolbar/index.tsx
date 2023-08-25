import * as Ariakit from "@ariakit/react";
import { bold, italic, redo, underline, undo } from "./icons.js";
import "./style.css";

export default function Example() {
  const toolbar = Ariakit.useToolbarStore();
  return (
    <Ariakit.Toolbar store={toolbar} className="toolbar">
      <Ariakit.ToolbarItem className="button secondary">
        {undo}
        Undo
      </Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem className="button secondary" disabled>
        {redo}
        Redo
      </Ariakit.ToolbarItem>
      <Ariakit.ToolbarSeparator className="separator" />
      <Ariakit.ToolbarItem className="button secondary">
        {bold}
        Bold
      </Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem className="button secondary">
        {italic}
        Italic
      </Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem className="button secondary">
        {underline}
        Underline
      </Ariakit.ToolbarItem>
    </Ariakit.Toolbar>
  );
}
