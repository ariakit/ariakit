import * as React from "react";
import { render } from "react-testing-library";
import { MenuItemRadio } from "../MenuItemRadio";

const props: Parameters<typeof MenuItemRadio>[0] = {
  name: "checkbox",
  value: "checkbox",
  values: {},
  stopId: "item",
  stops: [],
  currentId: null,
  pastId: null,
  update: jest.fn(),
  register: jest.fn(),
  unregister: jest.fn(),
  move: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  first: jest.fn(),
  last: jest.fn()
};

test("render", () => {
  const { baseElement } = render(<MenuItemRadio {...props} />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-checked="false"
      id="item"
      role="menuitemradio"
      tabindex="-1"
      type="radio"
      value="checkbox"
    />
  </div>
</body>
`);
});
