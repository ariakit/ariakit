import * as React from "react";
import { render } from "@testing-library/react";
import { StaticMenu } from "../StaticMenu";

const props: Parameters<typeof StaticMenu>[0] = {
  stops: [],
  move: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  "aria-label": "menu"
};

test("render", () => {
  const { baseElement } = render(<StaticMenu {...props} />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-label="menu"
          role="menu"
        />
      </div>
    </body>
  `);
});
