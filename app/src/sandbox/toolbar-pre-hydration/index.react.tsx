import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <Ariakit.Toolbar aria-label="Undefined active ID">
        <Ariakit.ToolbarItem>Undo</Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem disabled>Redo</Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
      <Ariakit.ToolbarProvider defaultActiveId={null}>
        <Ariakit.Toolbar aria-label="Null active ID">
          <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>
          <Ariakit.ToolbarItem disabled>Strikethrough</Ariakit.ToolbarItem>
          <Ariakit.ToolbarItem>Underline</Ariakit.ToolbarItem>
        </Ariakit.Toolbar>
      </Ariakit.ToolbarProvider>
    </div>
  );
}
