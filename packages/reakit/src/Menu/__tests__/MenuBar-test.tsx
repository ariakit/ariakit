import * as React from "react";
import { render } from "@testing-library/react";
import { MenuBar } from "../MenuBar";

const props: Parameters<typeof MenuBar>[0] = {
  stops: [],
  move: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  "aria-label": "menu"
};

test("render", () => {
  const { baseElement } = render(<MenuBar {...props} />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-label="menu"
          role="menubar"
        />
      </div>
    </body>
  `);
});
