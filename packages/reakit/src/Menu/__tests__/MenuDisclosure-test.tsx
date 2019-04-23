import * as React from "react";
import { render } from "react-testing-library";
import { MenuDisclosure } from "../MenuDisclosure";

const props: Parameters<typeof MenuDisclosure>[0] = {
  unstable_hiddenId: "disclosure",
  toggle: jest.fn(),
  placement: "bottom",
  show: jest.fn(),
  first: jest.fn(),
  last: jest.fn()
};

test("render", () => {
  const { baseElement } = render(
    <MenuDisclosure {...props}>disclosure</MenuDisclosure>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="disclosure"
          aria-expanded="false"
          aria-haspopup="menu"
          role="button"
          tabindex="0"
          type="button"
        >
          disclosure
        </button>
      </div>
    </body>
  `);
});
