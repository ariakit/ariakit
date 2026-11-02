import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("reveals the hidden steps as links", async () => {
  expect(q.link.maybe("Engineering")).not.toBeInTheDocument();
  await click(q.button("Show 3 more steps"));
  const hidden = q.within(q.navigation("More steps"));
  expect(hidden.link("Engineering")).toBeVisible();
  expect(hidden.link("Platform team")).toBeVisible();
  expect(hidden.link("Observability")).toBeVisible();
});

test("returns focus to the button on Escape", async () => {
  await click(q.button("Show 3 more steps"));
  await press.Escape();
  expect(q.button("Show 3 more steps")).toHaveFocus();
  expect(q.link.maybe("Engineering")).not.toBeInTheDocument();
});
