import * as React from "react";
import { render } from "react-testing-library";
import { MenuItemDisclosure } from "../MenuItemDisclosure";

const props: Parameters<typeof MenuItemDisclosure>[0] = {
  stopId: "item",
  hiddenId: "hidden",
  toggle: jest.fn(),
  placement: "bottom",
  show: jest.fn(),
  last: jest.fn(),
  hide: jest.fn(),
  parent: {
    stops: [],
    currentId: null,
    loop: false,
    pastId: null,
    register: jest.fn(),
    unregister: jest.fn(),
    move: jest.fn(),
    next: jest.fn(),
    previous: jest.fn(),
    first: jest.fn(),
    last: jest.fn(),
    reset: jest.fn(),
    orientate: jest.fn()
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
