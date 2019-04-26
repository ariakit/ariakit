import * as React from "react";
import { render } from "react-testing-library";
import { Provider, Box } from "reakit";
import * as system from "..";

Provider.unstable_use(system);

test("useBox", () => {
  const { baseElement } = render(
    <Provider>
      <Box unstable_system={{ palette: "primary", fill: "opaque" }}>Box</Box>
    </Provider>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          style="color: rgb(255, 255, 255); background-color: rgb(0, 123, 255);"
        >
          Box
        </div>
      </div>
    </body>
  `);
});
