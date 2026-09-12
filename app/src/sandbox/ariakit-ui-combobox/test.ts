import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7473
test("updates a persistent empty-result status outside the options", async () => {
  const input = q.combobox("Destination");
  const status = q.status();
  expect(status).toBeEmptyDOMElement();
  await type("xyz", input);
  const list = q.listbox("Destination");
  const dialog = q.dialog("Destination");
  expect(dialog).toHaveTextContent("No results found");
  expect(list).not.toHaveTextContent("No results found");
  expect(status).toHaveTextContent("No results found");
  expect(status).toHaveAttribute("aria-live", "polite");
  expect(status).toHaveAttribute("aria-atomic", "true");
  expect(dialog).not.toContainElement(status);
  await press.Backspace();
  await press.Backspace();
  await press.Backspace();
  expect(list).toHaveTextContent("Argentina");
  expect(status).toBeEmptyDOMElement();
  await press.Escape();
  expect(status).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7473
test("replaces the select placeholder when a region is selected", async () => {
  const select = q.combobox("Shipping region");
  expect(select).toHaveTextContent("Choose a region");
  await click(select);
  await click(q.option("Europe"));
  expect(select).toHaveTextContent("Europe");
});

// https://github.com/ariakit/ariakit/issues/7473
test("restores a rich placeholder after clearing a multiple selection", async () => {
  const select = q.combobox("Extra regions");
  expect(select).toHaveTextContent("No regions selected");
  expect(select.querySelector("em")).toBeVisible();
  await click(select);
  await click(q.option("Europe"));
  await click(q.option("Asia"));
  expect(select).toHaveTextContent("Europe, Asia");
  await click(q.option("Europe"));
  await click(q.option("Asia"));
  expect(select).toHaveTextContent("No regions selected");
});

// https://github.com/ariakit/ariakit/issues/7473
test("preserves default selection and explicit display content with a placeholder", () => {
  expect(q.combobox("Automatic region")).toHaveTextContent("Europe");
  expect(q.combobox("Custom prompt")).toHaveTextContent("0");
  expect(q.combobox("Blank prompt").textContent).toBe("");
  expect(q.combobox("Zero prompt")).toHaveTextContent("0");
});

// https://github.com/ariakit/ariakit/issues/7473
test("keeps searchable select roles and keyboard selection with the UI list", async () => {
  const dialog = q.dialog("Timezone");
  const input = q.combobox("Search timezones");
  expect(dialog).toContainElement(input);
  expect(dialog).toContainElement(q.listbox("Timezone"));
  await type("Tokyo", input);
  await press.ArrowDown();
  await press.Enter();
  expect(q.combobox("Timezone")).toHaveTextContent("Asia/Tokyo");
});
