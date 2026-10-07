import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7785
test("moves focus to the dialog that React replaced around the opener", async () => {
  await click(q.button("Edit order"));
  await click(q.button("Payment"));
  expect(q.dialog("Payment")).toBeVisible();

  // The order editor changes its element, so React replaces the "Payment"
  // button that opened the payment dialog.
  await click(q.button("Mark as paid"));
  expect(q.text("Status: paid")).toBeVisible();

  await press.Escape();
  expect(q.dialog.maybe("Payment")).not.toBeInTheDocument();
  // The order editor is still open, so focus goes to it and not to the "Edit
  // order" button outside it.
  expect(q.dialog("Order")).toHaveFocus();
});
