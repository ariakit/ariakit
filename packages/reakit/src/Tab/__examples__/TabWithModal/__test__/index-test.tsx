import * as React from "react";
import { click, focus, press, render, wait } from "reakit-test-utils";
import Tab from "../index";

test("should open modal content tab", async () => {
  const { getByText } = render(<Tab />);
  const name = getByText("Open modal...");
  expect(name).toBeVisible();

  const tabOne = getByText("Tab 1");

  expect(tabOne).not.toBeVisible();

  click(name);
  expect(tabOne).toBeVisible();

  const contentTabOne = getByText("Content Tab 1");
  expect(contentTabOne).toBeVisible();

  const tabTwo = getByText("Tab 2");
  click(tabTwo);
  expect(tabTwo).toHaveFocus();

  const contentTab = getByText("Content Tab 2");
  expect(contentTab).toBeVisible();

  const close = getByText("Close");
  focus(close);
  expect(close).toHaveFocus();
  press.Enter();

  await wait(() => {
    expect(tabOne).not.toBeVisible();
  });

  expect(name).toBeVisible();
});
