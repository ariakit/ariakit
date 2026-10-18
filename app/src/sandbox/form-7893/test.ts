import { click, press, q, sleep, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7893
test("validating stays true while a newer validation is pending", async () => {
  await click(q.textbox("Username"));
  await type("ada");
  await expect.poll(q.text.lazy(/Username check: pending/)).toBeVisible();
  // Each cancelled check settles its validate() call one frame later, so cross
  // that frame before asserting the flag that must stay set.
  await sleep();
  await expect.poll(q.text.lazy(/Validating: yes/)).toBeVisible();
  expect(q.button("Add")).toHaveAttribute("aria-disabled", "true");

  await click(q.button("Finish username check"));
  await expect.poll(q.text.lazy("Username is taken")).toBeVisible();
  await expect.poll(q.text.lazy(/Validating: no/)).toBeVisible();
  expect(q.button("Add")).toHaveAttribute("aria-disabled", "true");
});

// https://github.com/ariakit/ariakit/issues/7893
test("submitting stays true while a newer submission is pending", async () => {
  await click(q.textbox("Draft"));
  await press.Enter();
  await press.Tab();
  await expect.poll(q.text.lazy(/Pending saves: 2/)).toBeVisible();
  await expect.poll(q.text.lazy(/Submitting: yes/)).toBeVisible();

  await click(q.button("Finish oldest save"));
  await expect.poll(q.text.lazy(/Completed: 1/)).toBeVisible();
  // The first submit() call settles one frame after its callback completes, so
  // cross that frame before asserting the flag that must stay set.
  await sleep();
  await expect.poll(q.text.lazy(/Pending saves: 1/)).toBeVisible();
  await expect.poll(q.text.lazy(/Submitting: yes/)).toBeVisible();
  expect(q.button("Save draft")).toHaveAttribute("aria-disabled", "true");

  await click(q.button("Finish oldest save"));
  await expect.poll(q.text.lazy(/Completed: 2/)).toBeVisible();
  await expect.poll(q.text.lazy(/Submitting: no/)).toBeVisible();
  expect(q.button("Save draft")).not.toHaveAttribute("aria-disabled");
});
