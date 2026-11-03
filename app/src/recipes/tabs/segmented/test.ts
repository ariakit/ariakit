import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("changes the stats with the selected time range", async () => {
  expect(q.tabpanel("Week")).toHaveTextContent("8,912");
  await click(q.tab("Month"));
  expect(q.tabpanel("Month")).toHaveTextContent("36,450");
  expect(q.tabpanel.maybe("Week")).not.toBeInTheDocument();
  await press.Home();
  expect(q.tab("Day")).toHaveFocus();
  expect(q.tabpanel("Day")).toHaveTextContent("1,204");
});
