import * as React from "react";
import { render } from "@testing-library/react";
import { DialogBackdrop } from "../DialogBackdrop";

test("render", () => {
  const { baseElement } = render(<DialogBackdrop />);
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
  const { baseElement } = render(<DialogBackdrop visible />);
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
