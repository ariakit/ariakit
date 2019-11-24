import * as React from "react";
import { render } from "@testing-library/react";
import { useToolbarState, Toolbar, ToolbarItem } from "..";

test("markup", () => {
  const Test = () => {
    const toolbar = useToolbarState();
    return (
      <Toolbar {...toolbar} id="base" aria-label="toolbar">
        <ToolbarItem {...toolbar}>Item 1</ToolbarItem>
        <ToolbarItem {...toolbar}>Item 2</ToolbarItem>
        <ToolbarItem {...toolbar}>Item 3</ToolbarItem>
      </Toolbar>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        aria-label="toolbar"
        aria-orientation="horizontal"
        id="base"
        role="toolbar"
      >
        <button
          id="base-1"
          tabindex="0"
        >
          Item 1
        </button>
        <button
          id="base-2"
          tabindex="-1"
        >
          Item 2
        </button>
        <button
          id="base-3"
          tabindex="-1"
        >
          Item 3
        </button>
      </div>
    </div>
  `);
});
