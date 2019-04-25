// TODO: Add more tests
import * as React from "react";
import { render } from "react-testing-library";
import { unstable_KeyBinder as KeyBinder } from "../KeyBinder";

test("render", () => {
  const { baseElement } = render(<KeyBinder />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div />
      </div>
    </body>
  `);
});
