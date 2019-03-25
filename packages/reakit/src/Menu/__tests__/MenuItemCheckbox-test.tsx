import * as React from "react";
import { render } from "react-testing-library";
import { unstable_MenuItemCheckbox as MenuItemCheckbox } from "../MenuItemCheckbox";

const props: Parameters<typeof MenuItemCheckbox>[0] = {
  name: "checkbox",
  unstable_values: {},
  stopId: "item",
  unstable_stops: [],
  unstable_currentId: null,
  unstable_pastId: null,
  unstable_update: jest.fn(),
  unstable_register: jest.fn(),
  unstable_unregister: jest.fn(),
  unstable_move: jest.fn(),
  unstable_next: jest.fn(),
  unstable_previous: jest.fn(),
  unstable_first: jest.fn(),
  unstable_last: jest.fn()
};

test("render", () => {
  const { baseElement } = render(<MenuItemCheckbox {...props} />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-checked="false"
      id="item"
      name="checkbox"
      role="menuitemcheckbox"
      tabindex="0"
      type="checkbox"
      value=""
    />
  </div>
</body>
`);
});
