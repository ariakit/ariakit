import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// A text query finds the text part inside an error, so find the error from the
// first id in the description of its field.
function getFieldError(field: HTMLElement) {
  const [errorId] = field.getAttribute("aria-describedby")?.split(" ") ?? [];
  return document.getElementById(errorId ?? "");
}

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

test("keeps a decorative default check when the custom icon is false", async () => {
  await click(q.combobox("Notifications"));
  const email = q.option("Email");
  const sms = q.option("SMS");
  expect(email.firstElementChild).toHaveAttribute("aria-hidden", "true");
  expect(sms.firstElementChild).toHaveAttribute("aria-hidden", "true");
  expect(sms.querySelector("svg")).not.toBeInTheDocument();
  await click(sms);
  expect(sms).toHaveAttribute("aria-selected", "true");
  expect(sms.querySelector("svg")).toBeInTheDocument();
  await click(email);
  expect(email).toHaveAttribute("aria-selected", "false");
  expect(email.querySelector("svg")).not.toBeInTheDocument();
  expect(q.combobox("Notifications")).toHaveTextContent("SMS");
});

// https://github.com/ariakit/ariakit/issues/8053
test("marks the select error with an icon that the description leaves out", () => {
  const box = q.within(q.article("Select fields"));
  const error = getFieldError(box.combobox("Delivery country"));
  expect(error).toHaveTextContent("Choose a country.");
  expect(error?.querySelectorAll("svg")).toHaveLength(1);
  expect(box.combobox("Delivery country")).toHaveAccessibleDescription(
    "Choose a country.",
  );
});

// The browser test also checks that the icon label stays out of the select
// description. The description here leaves out SVG labels even when the icon is
// not hidden, so it can't catch that.
// https://github.com/ariakit/ariakit/issues/8053
test("replaces the select error icon with another icon", () => {
  const error = getFieldError(
    q
      .within(q.article("Select error with another icon"))
      .combobox("Billing plan"),
  );
  expect(error).toHaveTextContent("Only an owner can change the plan.");
  expect(error?.querySelectorAll("svg")).toHaveLength(1);
  expect(error?.querySelector("svg[aria-label='Locked']")).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/8053
test("removes the select error icon with icon false", () => {
  const box = q.within(q.article("Select error without an icon"));
  const error = getFieldError(box.combobox("Report frequency"));
  expect(error).toHaveTextContent("Weekly reports need a team plan.");
  // No hidden icon part either, so the text starts at the edge, like the hint.
  expect(error?.querySelector("[aria-hidden]")).not.toBeInTheDocument();
  expect(error?.querySelector("svg")).not.toBeInTheDocument();
  expect(box.combobox("Report frequency")).toHaveAccessibleDescription(
    "Weekly reports need a team plan. Reports go to every admin.",
  );
});

// https://github.com/ariakit/ariakit/issues/8053
test("removes the select error icon when the error text clears", async () => {
  const select = q
    .within(q.article("Select error that clears"))
    .combobox("Billing country");
  // The error keeps its element, so the text query would no longer find it once
  // the text clears.
  const error = getFieldError(select);
  expect(error?.querySelectorAll("svg")).toHaveLength(1);
  await click(select);
  await click(q.within(q.listbox("Billing country")).option("Spain"));
  expect(select).not.toHaveAttribute("aria-invalid");
  expect(error).toBeInTheDocument();
  expect(error?.querySelector("svg")).not.toBeInTheDocument();
});
