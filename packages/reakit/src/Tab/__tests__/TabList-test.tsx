import * as React from "react";
import { render } from "reakit-test-utils";
import { TabList } from "../TabList";

const props: Parameters<typeof TabList>[0] = {
  "aria-label": "tablist"
};

test("render", () => {
  const { baseElement } = render(<TabList {...props}>tablist</TabList>);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-label="tablist"
          id="id-f3t0fi"
          role="tablist"
        >
          tablist
        </div>
      </div>
    </body>
  `);
});

test("render orientation", () => {
  const { baseElement } = render(
    <TabList {...props} orientation="horizontal">
      tablist
    </TabList>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-label="tablist"
          aria-orientation="horizontal"
          id="id-iqsgqj"
          role="tablist"
        >
          tablist
        </div>
      </div>
    </body>
  `);
});
