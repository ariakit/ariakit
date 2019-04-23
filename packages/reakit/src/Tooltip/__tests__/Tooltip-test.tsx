import * as React from "react";
import { render } from "react-testing-library";
import { Tooltip } from "../Tooltip";

test("render", () => {
  const { baseElement } = render(<Tooltip>tooltip</Tooltip>);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div />
      <div
        class="__reakit-portal"
      >
        <div
          aria-hidden="true"
          hidden=""
          role="tooltip"
          style="pointer-events: none;"
        >
          tooltip
        </div>
      </div>
    </body>
  `);
});

test("render visible", () => {
  const { baseElement } = render(<Tooltip visible>tooltip</Tooltip>);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div />
      <div
        class="__reakit-portal"
      >
        <div
          aria-hidden="false"
          role="tooltip"
          style="pointer-events: none;"
        >
          tooltip
        </div>
      </div>
    </body>
  `);
});
