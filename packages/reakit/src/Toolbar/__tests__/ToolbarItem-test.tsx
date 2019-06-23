import * as React from "react";
import { render } from "@testing-library/react";
import { ToolbarItem } from "../ToolbarItem";

const props: Parameters<typeof ToolbarItem>[0] = {
  stopId: "rover",
  stops: [],
  currentId: null,
  register: jest.fn(),
  unregister: jest.fn(),
  move: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  first: jest.fn(),
  last: jest.fn()
};

test("render", () => {
  const { baseElement } = render(<ToolbarItem {...props}>button</ToolbarItem>);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          id="rover"
          tabindex="-1"
        >
          button
        </button>
      </div>
    </body>
  `);
});
