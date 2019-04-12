import * as React from "react";
import { render } from "react-testing-library";
import { MenuItemCheckbox } from "../MenuItemCheckbox";

const props: Parameters<typeof MenuItemCheckbox>[0] = {
  name: "checkbox",
  stopId: "item",
  unstable_stops: [],
  currentId: null,
  unstable_pastId: null,
  unstable_register: jest.fn(),
  unstable_unregister: jest.fn(),
  move: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  first: jest.fn(),
  last: jest.fn(),
  unstable_values: {},
  unstable_update: jest.fn()
};

test("render", () => {
  const { baseElement } = render(<MenuItemCheckbox {...props} />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-checked="false"
          id="item"
          name="checkbox"
          role="menuitemcheckbox"
          tabindex="-1"
          type="checkbox"
        />
      </div>
    </body>
  `);
});
