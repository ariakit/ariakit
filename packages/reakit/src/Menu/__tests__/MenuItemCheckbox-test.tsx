import * as React from "react";
import { render } from "react-testing-library";
import { unstable_MenuItemCheckbox as MenuItemCheckbox } from "../MenuItemCheckbox";

const props: Parameters<typeof MenuItemCheckbox>[0] = {
  name: "checkbox",
  stopId: "item",
  placement: "top",
  hide: jest.fn(),
  visible: true,
  unstable_hiddenId: "item",
  unstable_loop: false,
  unstable_stops: [],
  unstable_currentId: null,
  unstable_pastId: null,
  unstable_register: jest.fn(),
  unstable_unregister: jest.fn(),
  unstable_move: jest.fn(),
  unstable_next: jest.fn(),
  unstable_previous: jest.fn(),
  unstable_first: jest.fn(),
  unstable_last: jest.fn(),
  unstable_referenceRef: React.createRef(),
  unstable_popoverRef: React.createRef(),
  unstable_arrowRef: React.createRef(),
  unstable_popoverStyles: {},
  unstable_arrowStyles: {},
  unstable_originalPlacement: "bottom",
  unstable_values: {},
  unstable_reset: jest.fn(),
  unstable_orientate: jest.fn(),
  show: jest.fn(),
  toggle: jest.fn(),
  place: jest.fn(),
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
