import * as React from "react";
import { render, focus, click } from "reakit-test-utils";
import { Tab, TabList, TabPanel, useTabState, TabInitialState } from "..";

function SimpleTest(props: TabInitialState = {}) {
  const tab = useTabState(props);
  return (
    <>
      <TabList {...tab} aria-label="tablist">
        <Tab {...tab} stopId="tab1">
          tab1
        </Tab>
        <Tab {...tab} stopId="tab2">
          tab2
        </Tab>
        <Tab {...tab} stopId="tab3">
          tab3
        </Tab>
      </TabList>
      <TabPanel {...tab} stopId="tab1">
        tabpanel1
      </TabPanel>
      <TabPanel {...tab} stopId="tab2">
        tabpanel2
      </TabPanel>
      <TabPanel {...tab} stopId="tab3">
        tabpanel3
      </TabPanel>
    </>
  );
}

test("no tab is selected", () => {
  const { getByText } = render(<SimpleTest />);
  const tabpanel1 = getByText("tabpanel1");
  const tabpanel2 = getByText("tabpanel2");
  const tabpanel3 = getByText("tabpanel3");
  expect(tabpanel1).not.toBeVisible();
  expect(tabpanel2).not.toBeVisible();
  expect(tabpanel3).not.toBeVisible();
});

test("focusing tab reveals the panel", () => {
  const { getByText } = render(<SimpleTest />);
  const tab1 = getByText("tab1");
  const tabpanel1 = getByText("tabpanel1");
  const tabpanel2 = getByText("tabpanel2");
  const tabpanel3 = getByText("tabpanel3");
  expect(tabpanel1).not.toBeVisible();
  focus(tab1);
  expect(tabpanel1).toBeVisible();
  expect(tabpanel2).not.toBeVisible();
  expect(tabpanel3).not.toBeVisible();
});

test("focusing tab does not reveal the panel when manual is truthy", () => {
  const { getByText } = render(<SimpleTest manual />);
  const tab2 = getByText("tab2");
  const tabpanel2 = getByText("tabpanel2");
  expect(tabpanel2).not.toBeVisible();
  focus(tab2);
  expect(tabpanel2).not.toBeVisible();
});

test("clicking on tab reveals the panel", () => {
  const { getByText } = render(<SimpleTest />);
  const tab3 = getByText("tab3");
  const tabpanel3 = getByText("tabpanel3");
  expect(tabpanel3).not.toBeVisible();
  click(tab3);
  expect(tabpanel3).toBeVisible();
});

test("markup", () => {
  const { container } = render(<SimpleTest baseId="base" />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        aria-label="tablist"
        role="tablist"
      >
        <button
          aria-controls="base-tab1-panel"
          aria-selected="false"
          id="base-tab1"
          role="tab"
          tabindex="0"
        >
          tab1
        </button>
        <button
          aria-controls="base-tab2-panel"
          aria-selected="false"
          id="base-tab2"
          role="tab"
          tabindex="-1"
        >
          tab2
        </button>
        <button
          aria-controls="base-tab3-panel"
          aria-selected="false"
          id="base-tab3"
          role="tab"
          tabindex="-1"
        >
          tab3
        </button>
      </div>
      <div
        aria-labelledby="base-tab1"
        class="hidden"
        hidden=""
        id="base-tab1-panel"
        role="tabpanel"
        style="display: none;"
        tabindex="0"
      >
        tabpanel1
      </div>
      <div
        aria-labelledby="base-tab2"
        class="hidden"
        hidden=""
        id="base-tab2-panel"
        role="tabpanel"
        style="display: none;"
        tabindex="0"
      >
        tabpanel2
      </div>
      <div
        aria-labelledby="base-tab3"
        class="hidden"
        hidden=""
        id="base-tab3-panel"
        role="tabpanel"
        style="display: none;"
        tabindex="0"
      >
        tabpanel3
      </div>
    </div>
  `);
});
