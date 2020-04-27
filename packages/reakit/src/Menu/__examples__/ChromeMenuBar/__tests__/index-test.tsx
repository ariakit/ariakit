import * as React from "react";
import { render, hover, click, wait } from "reakit-test-utils";
import ChromeMenuBar from "..";

test("open and hover menus", async () => {
  const { getByText: text, getByLabelText: label } = render(<ChromeMenuBar />);
  expect(label("File")).not.toBeVisible();
  click(text("File"));
  await wait(expect(label("File")).toBeVisible);
  expect(text("File")).toHaveFocus();
  hover(text("Edit"));
  await wait(expect(label("Edit")).toBeVisible);
  expect(text("Edit")).toHaveFocus();
});
