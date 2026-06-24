import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Ariakit.Toolbar
        aria-label="Text formatting"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, width: 240 }}
      >
        <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem>Underline</Ariakit.ToolbarItem>
        <Ariakit.ToolbarSeparator
          aria-label="Row divider"
          aria-orientation="horizontal"
          orientation="horizontal"
          style={{ margin: 0, width: "100%" }}
        />
        <Ariakit.ToolbarItem>Undo</Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem>Redo</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
      <Ariakit.Separator
        aria-label="Plain divider"
        orientation="vertical"
        style={{ height: 32, margin: 0 }}
      />
    </div>
  );
}
