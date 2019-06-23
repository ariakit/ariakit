import * as React from "react";
import { render } from "@testing-library/react";
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
          role="tablist"
        >
          tablist
        </div>
      </div>
    </body>
  `);
});
