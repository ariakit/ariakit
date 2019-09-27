import * as React from "react";
import { render } from "@testing-library/react";
import { Group } from "../Group";

test("render", () => {
  const { baseElement } = render(<Group />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          role="group"
        />
      </div>
    </body>
  `);
});
