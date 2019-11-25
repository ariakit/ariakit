import * as React from "react";
import { render } from "reakit-test-utils";
import { unstable_IdGroup as IdGroup } from "../IdGroup";
import { unstable_IdProvider as IdProvider } from "../IdProvider";

test("render", () => {
  const { baseElement } = render(
    <IdProvider>
      <IdGroup />
    </IdProvider>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div />
      </div>
    </body>
  `);
});
