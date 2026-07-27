import { dispatch, focus, q } from "@ariakit/test";
import { expect, test } from "vitest";

function getNativeSelect() {
  return q.labeled("Role", { selector: "select" });
}

// examples/select-autofill/test.ts
test("mirrors native autofill and redirects native focus", async () => {
  const select = q.combobox("Role");
  await dispatch.change(getNativeSelect(), { target: { value: "Tutor" } });
  expect(select).toHaveAttribute("data-autofill");
  expect(select).toHaveTextContent("Tutor");

  await focus(getNativeSelect());
  await expect.poll(() => select).toHaveFocus();
});
