import * as React from "react";
import { render } from "@testing-library/react";
import { Provider, Box } from "reakit";
import * as system from "..";

test("useBox", () => {
  const { baseElement } = render(
    <Provider unstable_system={system}>
      <Box unstable_system={{ palette: "primary", fill: "opaque" }}>Box</Box>
    </Provider>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          style="color: rgb(255, 255, 255); background-color: rgb(0, 109, 255);"
        >
          Box
        </div>
      </div>
    </body>
  `);
});
