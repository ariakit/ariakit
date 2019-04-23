import * as React from "react";
import { render } from "react-testing-library";
import { Separator } from "../Separator";

test("render", () => {
  const { baseElement } = render(<Separator />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <hr
          aria-orientation="horizontal"
          role="separator"
        />
      </div>
    </body>
  `);
});

test("render horizontal", () => {
  const { baseElement } = render(<Separator orientation="horizontal" />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <hr
          aria-orientation="vertical"
          role="separator"
        />
      </div>
    </body>
  `);
});
