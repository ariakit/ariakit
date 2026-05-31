import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <button type="button">Before toolbar</button>
      <Ariakit.Toolbar aria-label="Text formatting" className="toolbar">
        <Ariakit.ToolbarContainer
          aria-label="Font family"
          className="toolbar-container"
        >
          <label className="field">
            <span>Font family</span>
            <input defaultValue="Inter" />
          </label>
        </Ariakit.ToolbarContainer>
        <Ariakit.ToolbarItem
          className="input"
          render={<input aria-label="Text size" defaultValue="Medium" />}
        />
        <Ariakit.ToolbarItem className="button">Apply</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
      <Ariakit.Toolbar
        aria-label="Vertical formatting"
        className="toolbar vertical"
        orientation="vertical"
      >
        <Ariakit.ToolbarItem className="button">Move up</Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem className="button">Move down</Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem className="button">Reset</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
    </div>
  );
}
