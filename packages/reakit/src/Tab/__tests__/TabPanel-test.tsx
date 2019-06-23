import * as React from "react";
import { render } from "@testing-library/react";
import { TabPanel } from "../TabPanel";

const props: Parameters<typeof TabPanel>[0] = {
  unstable_baseId: "base",
  stopId: "tab",
  selectedId: null
};

test("render", () => {
  const { baseElement } = render(<TabPanel {...props}>tabpanel</TabPanel>);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-labelledby="base-tab"
          class="hidden"
          hidden=""
          id="base-tab-panel"
          role="tabpanel"
          style="display: none;"
          tabindex="0"
        >
          tabpanel
        </div>
      </div>
    </body>
  `);
});

test("render visible", () => {
  const { baseElement } = render(
    <TabPanel {...props} visible>
      tabpanel
    </TabPanel>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-labelledby="base-tab"
          id="base-tab-panel"
          role="tabpanel"
          tabindex="0"
        >
          tabpanel
        </div>
      </div>
    </body>
  `);
});

test("render selected", () => {
  const { baseElement } = render(
    <TabPanel {...props} selectedId="tab">
      tabpanel
    </TabPanel>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-labelledby="base-tab"
          id="base-tab-panel"
          role="tabpanel"
          tabindex="0"
        >
          tabpanel
        </div>
      </div>
    </body>
  `);
});
