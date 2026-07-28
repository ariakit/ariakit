import { dispatch, focus, q } from "@ariakit/test";
import { expect, test } from "vitest";

const getNativeSelect = () => q.labeled("Role", { selector: "select" });

test("select has data-autofill attribute", async () => {
  expect(q.combobox()).not.toHaveAttribute("data-autofill");
  await dispatch.change(getNativeSelect(), { target: { value: "Tutor" } });
  expect(q.combobox()).toHaveAttribute("data-autofill");
});

test("focusing on native select moves focus to custom select", async () => {
  expect(q.combobox()).not.toHaveFocus();
  await focus(getNativeSelect());
  await expect.poll(q.combobox).toHaveFocus();
});
