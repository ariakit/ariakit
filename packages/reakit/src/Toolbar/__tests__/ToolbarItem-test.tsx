import * as React from "react";
import { render } from "react-testing-library";
import { ToolbarItem } from "../ToolbarItem";

const props: Parameters<typeof ToolbarItem>[0] = {
  stopId: "rover",
  unstable_stops: [],
  currentId: null,
  unstable_pastId: null,
  unstable_register: jest.fn(),
  unstable_unregister: jest.fn(),
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
