import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
test("omits a conditional list button without hiding its content", async () => {
  expect(q.text("Review assigned issues")).toBeVisible();
  expect(q.button.all(/^$/)).toHaveLength(0);

  await click(q.checkbox("Show task headings"));
  expect(q.button("Project tasks")).toBeVisible();
  expect(q.text("Review assigned issues")).not.toBeVisible();
  await click(q.button("Project tasks"));
  expect(q.text("Review assigned issues")).toBeVisible();
  await click(q.button("Project tasks"));
  expect(q.text("Review assigned issues")).not.toBeVisible();

  await click(q.checkbox("Show task headings"));
  expect(q.text("Review assigned issues")).toBeVisible();
  expect(q.button.maybe("Project tasks")).not.toBeInTheDocument();
  expect(q.button.all(/^$/)).toHaveLength(0);
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
test("keeps zero as a list button label", async () => {
  const button = q.button("0");
  expect(button).toBeVisible();
  expect(button).toHaveAttribute("aria-expanded", "false");
  await click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(q.text("No pending tasks")).toBeVisible();
});
