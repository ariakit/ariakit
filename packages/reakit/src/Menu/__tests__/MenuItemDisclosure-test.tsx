import * as React from "react";
import { render } from "react-testing-library";
import { unstable_MenuItemDisclosure as MenuItemDisclosure } from "../MenuItemDisclosure";

const props: Parameters<typeof MenuItemDisclosure>[0] = {
  stopId: "item",
  unstable_hiddenId: "hidden",
  toggle: jest.fn(),
  placement: "bottom",
  show: jest.fn(),
  unstable_first: jest.fn(),
  unstable_last: jest.fn(),
  hide: jest.fn(),
  unstable_parent: {
    unstable_stops: [],
    unstable_currentId: null,
    unstable_loop: false,
    unstable_pastId: null,
    unstable_register: jest.fn(),
    unstable_unregister: jest.fn(),
    unstable_move: jest.fn(),
    unstable_next: jest.fn(),
    unstable_previous: jest.fn(),
    unstable_first: jest.fn(),
    unstable_last: jest.fn(),
    unstable_reset: jest.fn(),
    unstable_orientate: jest.fn()
  }
};

test("render", () => {
  const { baseElement } = render(
    <MenuItemDisclosure {...props}>item</MenuItemDisclosure>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      aria-controls="hidden"
      aria-expanded="false"
      aria-haspopup="menu"
      id="item"
      role="menuitem"
      tabindex="-1"
      type="button"
    >
      item
    </button>
  </div>
</body>
`);
});
