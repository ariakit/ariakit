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
  unstable_move: jest.fn(),
  unstable_next: jest.fn(),
  unstable_previous: jest.fn(),
  unstable_first: jest.fn(),
  unstable_last: jest.fn()
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
