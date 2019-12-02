import * as React from "react";
import { render } from "reakit-test-utils";
import { Toolbar } from "../Toolbar";

const props: Parameters<typeof Toolbar>[0] = {
  "aria-label": "toolbar"
};

test("render", () => {
  const { baseElement } = render(<Toolbar {...props}>toolbar</Toolbar>);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-label="toolbar"
          role="toolbar"
        >
          toolbar
        </div>
      </div>
    </body>
  `);
});

test("render orientation", () => {
  const { baseElement } = render(
    <Toolbar {...props} orientation="horizontal">
      toolbar
    </Toolbar>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-label="toolbar"
          aria-orientation="horizontal"
          role="toolbar"
        >
          toolbar
        </div>
      </div>
    </body>
  `);
});
