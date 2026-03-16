import * as Ariakit from "@ariakit/react";
import { useId } from "react";
import "./style.css";

// https://github.com/ariakit/ariakit/issues/3232
export default function Example() {
  const id = useId();
  return (
    <Ariakit.ToolbarProvider defaultActiveId={id}>
      <Ariakit.Toolbar className="toolbar">
        <Ariakit.ToolbarItem id={id} disabled className="button secondary">
          Bold
        </Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem className="button secondary">
          Italic
        </Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem className="button secondary">
          Underline
        </Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
    </Ariakit.ToolbarProvider>
  );
}
