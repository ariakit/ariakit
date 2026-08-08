import { click, press, q, type } from "@ariakit/test";
import { expect, test, vi } from "vitest";

function errors() {
  const ids =
    q.combobox.ensure().getAttribute("aria-describedby")?.split(" ") ?? [];
  return ids
    .map((id) => document.getElementById(id))
    .filter((element) => element?.textContent?.trim());
}

function spyOnAlert() {
  return vi.spyOn(window, "alert").mockImplementation(() => {});
}

test("click on label", async () => {
  await click(q.text("Favorite fruit"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveAttribute("data-focus-visible");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("show error on tabbing through select button", async () => {
  await press.Tab();
  await press.Tab();
  expect(q.combobox()).toHaveFocus();
  expect(errors()).toHaveLength(0);
  await press.Tab();
  expect(errors()).toHaveLength(1);
});

test("show error only on blur both the select button and the popover", async () => {
  await click(q.combobox());
  expect(errors()).toHaveLength(0);
  await press.Escape();
  expect(errors()).toHaveLength(0);
  await press.Space();
  await press.ArrowDown();
  await press.Enter();
  expect(errors()).toHaveLength(0);
  await press.Enter();
  await click(q.option("Select an item"));
  expect(errors()).toHaveLength(0);
  await press.Tab();
  expect(errors()).toHaveLength(1);
});

test("submit failed", async () => {
  expect(errors()).toHaveLength(0);
  await press.Tab();
  await type("John");
  await click(q.button("Submit"));
  expect(errors()).toHaveLength(1);
  expect(q.combobox()).toHaveFocus();
  expect(q.listbox()).not.toBeInTheDocument();
});

test("submit succeed", async () => {
  using alert = spyOnAlert();
  await press.Tab();
  await type("John");
  await click(q.combobox());
  await click(q.option("Banana"));
  expect(alert).not.toHaveBeenCalled();
  await press.Enter();
  expect(q.listbox()).toBeVisible();
  expect(alert).not.toHaveBeenCalled();
  await press.Escape();
  await press.Tab();
  await press.Enter();
  expect(alert).toHaveBeenCalledWith(
    JSON.stringify({
      name: "John",
      fruit: "Banana",
    }),
  );
  expect(q.combobox()).toHaveTextContent("Select an item");
});
