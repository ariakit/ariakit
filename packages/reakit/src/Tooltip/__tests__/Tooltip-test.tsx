import * as React from "react";
import { render } from "@testing-library/react";
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
          class="hidden"
          hidden=""
          role="tooltip"
          style="display: none; pointer-events: none;"
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
          role="tooltip"
          style="pointer-events: none;"
        >
          tooltip
        </div>
      </div>
    </body>
  `);
});

test("render without portal", () => {
  const { baseElement } = render(
    <Tooltip unstable_portal={false}>tooltip</Tooltip>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          class="hidden"
          hidden=""
          role="tooltip"
          style="display: none; pointer-events: none;"
        >
          tooltip
        </div>
      </div>
    </body>
  `);
});
