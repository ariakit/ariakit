import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows the panel of each tab", async () => {
  expect(q.tabpanel("Overview")).toHaveTextContent("June release");
  await click(q.tab("Activity"));
  expect(q.tabpanel("Activity")).toHaveTextContent("Maya Chen");
  expect(q.tabpanel.maybe("Overview")).not.toBeInTheDocument();
});

test("moves between tabs and selects them with the arrow keys", async () => {
  await click(q.tab("Overview"));
  await press.ArrowRight();
  expect(q.tab("Activity")).toHaveFocus();
  expect(q.tabpanel("Activity")).toBeVisible();
  await press.End();
  expect(q.tab("Members")).toHaveFocus();
  expect(q.tabpanel("Members")).toBeVisible();
  await press.ArrowRight();
  expect(q.tab("Overview")).toHaveFocus();
});
