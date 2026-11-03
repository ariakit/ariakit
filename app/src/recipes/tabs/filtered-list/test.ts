import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("filters one list and names each tab with its count", async () => {
  expect(q.tab("Open 3")).toHaveAttribute("aria-selected", "true");
  const open = q.within(q.tabpanel("Open 3"));
  expect(open.listitem.all()).toHaveLength(3);
  expect(open.text("Login button overlaps the logo")).toBeVisible();

  await click(q.tab("Closed 3"));
  const closed = q.within(q.tabpanel("Closed 3"));
  expect(closed.listitem.all()).toHaveLength(3);
  expect(closed.text("Dates ignore the time zone")).toBeVisible();
  expect(
    closed.text.maybe("Login button overlaps the logo"),
  ).not.toBeInTheDocument();
});
