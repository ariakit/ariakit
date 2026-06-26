import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <>
      <button type="button">Before empty toolbar</button>
      <Ariakit.Toolbar
        aria-label="Empty text formatting"
        style={{ display: "flex", gap: 8 }}
      >
        <Ariakit.ToolbarContainer aria-label="Empty font family" role="group">
          <label>
            Empty font family <input />
          </label>
        </Ariakit.ToolbarContainer>
        <Ariakit.ToolbarItem>Apply</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
      <button type="button">Before filled toolbar</button>
      <Ariakit.Toolbar
        aria-label="Filled text formatting"
        style={{ display: "flex", gap: 8 }}
      >
        <Ariakit.ToolbarContainer aria-label="Font family" role="group">
          <label>
            Font family <input defaultValue="Inter" />
          </label>
        </Ariakit.ToolbarContainer>
        <Ariakit.ToolbarItem>Apply</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
    </>
  );
}
