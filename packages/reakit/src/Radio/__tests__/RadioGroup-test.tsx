import * as React from "react";
import { render } from "react-testing-library";
import { RadioGroup } from "../RadioGroup";

test("render", () => {
  const { baseElement } = render(<RadioGroup aria-label="radiogroup" />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <fieldset
          aria-label="radiogroup"
          role="radiogroup"
        />
      </div>
    </body>
  `);
});
