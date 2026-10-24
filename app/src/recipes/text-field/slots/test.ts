import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("names and describes the fields with slots", () => {
  expect(q.textbox("Amount")).toHaveAccessibleDescription(
    "Up to 10,000 per transfer.",
  );
  expect(q.combobox("Currency")).toHaveTextContent("USD");
  expect(q.textbox("Email")).toHaveAttribute("type", "email");
  expect(q.textbox("Domain")).toHaveAccessibleDescription("Verified.");
});

// The symbol is in the same group as its amount.
function getAmountGroup(name: string) {
  return q.within(q.textbox(name).parentElement);
}

test("names and describes the right-to-left fields", () => {
  expect(q.textbox("المبلغ")).toHaveAccessibleDescription(
    "حتى 10,000 لكل تحويل.",
  );
  expect(q.combobox("العملة")).toHaveTextContent("USD");
  expect(q.searchbox("الأعضاء")).toHaveAttribute("placeholder", "ابحث بالاسم");
});

test("shows the symbol of the chosen currency", async () => {
  expect(getAmountGroup("Amount").text("$")).toBeInTheDocument();
  await click(q.combobox("Currency"));
  await click(q.option("EUR"));
  expect(q.combobox("Currency")).toHaveTextContent("EUR");
  expect(getAmountGroup("Amount").text("€")).toBeInTheDocument();
  // Each amount keeps its own currency.
  expect(getAmountGroup("المبلغ").text("$")).toBeInTheDocument();
});

test("shows the initials of the display name", async () => {
  expect(q.text("AL")).toBeInTheDocument();
  await click(q.textbox("Display name"));
  await type("\b".repeat("Ada Lovelace".length));
  await type("Grace Hopper");
  expect(q.text("GH")).toBeInTheDocument();
});
