import * as React from "react";
import { render } from "react-testing-library";
import { PopoverBackdrop } from "../PopoverBackdrop";

test("render", () => {
  const { baseElement } = render(<PopoverBackdrop />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          class="hidden"
          hidden=""
          role="presentation"
          style="display: none; position: fixed; top: 0px; right: 0px; bottom: 0px; left: 0px; z-index: 998;"
        />
      </div>
    </body>
  `);
});

test("render visible", () => {
  const { baseElement } = render(<PopoverBackdrop visible />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          role="presentation"
          style="position: fixed; top: 0px; right: 0px; bottom: 0px; left: 0px; z-index: 998;"
        />
      </div>
    </body>
  `);
});
