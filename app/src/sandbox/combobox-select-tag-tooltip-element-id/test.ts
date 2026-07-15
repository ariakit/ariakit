import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("updates combobox relationships when the input id changes", async () => {
  const section = q.within(q.region("Combobox"));
  const label = section.text.ensure("Combobox label");
  const combobox = section.combobox("Combobox label");
  const cancel = section.button("Clear input");

  expect(label).toHaveAttribute("for", "combobox-before");
  expect(cancel).toHaveAttribute("aria-controls", "combobox-before");

  await click(section.button("Change combobox id"));

  await expect.poll(() => label.getAttribute("for")).toBe("combobox-after");
  expect(cancel).toHaveAttribute("aria-controls", "combobox-after");
  expect(combobox).toHaveAttribute("id", "combobox-after");
});

test("updates the tooltip anchor when the content id changes", async () => {
  const section = q.within(q.region("Tooltip"));
  const anchor = section.button.ensure("Tooltip label");

  expect(anchor).toHaveAttribute("aria-labelledby", "tooltip-before");

  await click(section.button("Change tooltip id"));

  await expect
    .poll(() => anchor.getAttribute("aria-labelledby"))
    .toBe("tooltip-after");
});
