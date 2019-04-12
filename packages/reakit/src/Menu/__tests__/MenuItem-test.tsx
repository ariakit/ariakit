import * as React from "react";
import { render } from "react-testing-library";
import { MenuItem } from "../MenuItem";

const props: Parameters<typeof MenuItem>[0] = {
  stopId: "item",
  unstable_stops: [],
  currentId: null,
  unstable_register: jest.fn(),
  unstable_unregister: jest.fn(),
  unstable_move: jest.fn(),
  unstable_next: jest.fn(),
  unstable_previous: jest.fn(),
  unstable_first: jest.fn(),
  unstable_last: jest.fn()
};

test("render", () => {
  const { baseElement } = render(<MenuItem {...props}>item</MenuItem>);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      id="item"
      role="menuitem"
      tabindex="-1"
    >
      item
    </button>
  </div>
</body>
`);
});
