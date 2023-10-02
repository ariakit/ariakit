import { click, press, q, type } from "@ariakit/test";

function setup() {
  const externalButton = document.createElement("button");
  externalButton.textContent = "External button";
  document.body.append(externalButton);
  return () => {
    externalButton.remove();
  };
}

test("show/hide cancel button", async () => {
  const cleanup = setup();
  await click(q.combobox("Favorite fruit"));
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.button("Clear input")).toHaveAttribute("data-visible");
  await press.Tab();
  expect(q.button("Clear input")).toHaveFocus();
  expect(q.button("Clear input")).toHaveAttribute("data-visible");
  await press.Enter();
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.button("Clear input")).toHaveAttribute("data-visible");
  await press.ShiftTab();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
  expect(q.button("Clear input")).not.toHaveAttribute("data-visible");
  await type("b");
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.option("Bacon")).toHaveFocus();
  expect(q.button("Clear input")).toHaveAttribute("data-visible");
  await type("ho");
  await press.ShiftTab();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
  expect(q.button("Clear input")).toHaveAttribute("data-visible");
  await click(q.button("Clear input"));
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.button("Clear input")).toHaveAttribute("data-visible");
  await press.Tab();
  await press.Tab();
  expect(q.dialog()).not.toBeInTheDocument();
  cleanup();
});

test("show focus-within styles", async () => {
  const cleanup = setup();
  expect(q.group()).not.toHaveClass("focus-within");
  await press.Tab();
  expect(q.group()).toHaveClass("focus-within");
  await press.Tab();
  expect(q.group()).not.toHaveClass("focus-within");
  await press.ShiftTab();
  expect(q.group()).toHaveClass("focus-within");
  await press.Enter();
  await press.Tab();
  await press.Tab();
  expect(q.group()).not.toHaveClass("focus-within");
  cleanup();
});
