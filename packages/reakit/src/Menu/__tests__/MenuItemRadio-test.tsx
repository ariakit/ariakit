import * as React from "react";
import { render } from "@testing-library/react";
import { MenuItemRadio } from "../MenuItemRadio";

const props: Parameters<typeof MenuItemRadio>[0] = {
  name: "radio",
  value: "radio",
  stopId: "item",
  stops: [],
  currentId: null,
  register: jest.fn(),
  unregister: jest.fn(),
  move: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  first: jest.fn(),
  last: jest.fn(),
  unstable_values: {},
  unstable_update: jest.fn()
};

test("render", () => {
  const { baseElement } = render(<MenuItemRadio {...props} />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-checked="false"
          id="item"
          role="menuitemradio"
          tabindex="-1"
          type="radio"
          value="radio"
        />
      </div>
    </body>
  `);
});
