import * as React from "react";
import { render } from "reakit-test-utils";
import { Provider, Role } from "reakit";
import * as system from "..";

test("useRole", () => {
  const { baseElement } = render(
    <Provider unstable_system={system}>
      <Role unstable_system={{ palette: "primary", fill: "opaque" }}>Role</Role>
    </Provider>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          style="color: rgb(255, 255, 255); background-color: rgb(0, 109, 255);"
        >
          Role
        </div>
      </div>
    </body>
  `);
});
