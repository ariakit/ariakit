import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

// https://github.com/ariakit/ariakit/issues/4129
export default function Example() {
  const [showItalic, setShowItalic] = useState(true);
  return (
    <>
      <Ariakit.Toolbar className="toolbar">
        <Ariakit.ToolbarItem className="button secondary">
          Bold
        </Ariakit.ToolbarItem>
        {showItalic && (
          <Ariakit.ToolbarItem className="button secondary">
            Italic
          </Ariakit.ToolbarItem>
        )}
        <Ariakit.ToolbarItem className="button secondary">
          Underline
        </Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
      <Ariakit.Button
        className="button"
        onClick={() => setShowItalic(!showItalic)}
      >
        Toggle Italic
      </Ariakit.Button>
    </>
  );
}
