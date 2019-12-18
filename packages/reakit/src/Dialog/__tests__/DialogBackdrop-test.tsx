import * as React from "react";
import { render } from "reakit-test-utils";
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

test("render with id", () => {
  const { baseElement } = render(<DialogBackdrop id="test" />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          class="hidden"
          hidden=""
          id="test"
          role="presentation"
          style="display: none;"
        />
      </div>
    </body>
  `);
});
