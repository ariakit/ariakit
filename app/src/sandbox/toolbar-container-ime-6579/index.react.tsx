import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.Toolbar
      aria-label="Text formatting"
      style={{ display: "flex", gap: 8 }}
    >
      <Ariakit.ToolbarContainer aria-label="IME field" role="group">
        <label>
          Message <input defaultValue="Draft" />
        </label>
      </Ariakit.ToolbarContainer>
      <Ariakit.ToolbarItem>Apply</Ariakit.ToolbarItem>
    </Ariakit.Toolbar>
  );
}
