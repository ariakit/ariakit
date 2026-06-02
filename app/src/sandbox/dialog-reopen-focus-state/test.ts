import { click, q, waitFor } from "@ariakit/test";
import { expect, test } from "vitest";

test("resets outside-interaction focus tracking when reopened", async () => {
  await click(q.button.ensure("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  await click(q.button.ensure("Focus inside"));
  await click(q.button.ensure("Close dialog"));
  await waitFor(() =>
    expect(q.dialog.includesHidden("Dialog")).not.toBeVisible(),
  );

  await click(q.button.ensure("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  const input = document.createElement("input");
  input.setAttribute("aria-label", "Dynamic outside input");
  document.body.append(input);

  try {
    input.focus();
    await waitFor(() =>
      expect(q.dialog.includesHidden("Dialog")).not.toBeVisible(),
    );
  } finally {
    input.remove();
  }
});
