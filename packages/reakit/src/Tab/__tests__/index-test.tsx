import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import { Tab, TabList, TabPanel, useTabState } from "..";
import { TabInitialState } from "../TabState";

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
  fireEvent.focus(tab1);
  expect(tabpanel1).toBeVisible();
  expect(tabpanel2).not.toBeVisible();
  expect(tabpanel3).not.toBeVisible();
});

test("focusing tab does not reveal the panel when manual is truthy", () => {
  const { getByText } = render(<SimpleTest unstable_manual />);
  const tab2 = getByText("tab2");
  const tabpanel2 = getByText("tabpanel2");
  expect(tabpanel2).not.toBeVisible();
  fireEvent.focus(tab2);
  expect(tabpanel2).not.toBeVisible();
});

test("clicking on tab reveals the panel", () => {
  const { getByText } = render(<SimpleTest />);
  const tab3 = getByText("tab3");
  const tabpanel3 = getByText("tabpanel3");
  expect(tabpanel3).not.toBeVisible();
  fireEvent.click(tab3);
  expect(tabpanel3).toBeVisible();
});
