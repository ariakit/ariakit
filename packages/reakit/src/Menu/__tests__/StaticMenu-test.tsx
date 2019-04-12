import * as React from "react";
import { render } from "react-testing-library";
import { StaticMenu } from "../StaticMenu";

const props: Parameters<typeof StaticMenu>[0] = {
  stops: [],
  move: jest.fn(),
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
