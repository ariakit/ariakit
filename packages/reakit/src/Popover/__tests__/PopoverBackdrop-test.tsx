import * as React from "react";
import { render } from "@testing-library/react";
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
          style="display: none;"
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
        />
      </div>
    </body>
  `);
});
