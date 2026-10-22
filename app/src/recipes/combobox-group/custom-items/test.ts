import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("filters and selects a custom result, then shows an empty state", async () => {
  await click(q.combobox("Find records"));
  await type("annual");
  expect(q.group("Files")).toBeVisible();
  expect(q.option(/annual_report\.pdf/)).toHaveTextContent("Documents");
  await click(q.option(/annual_report\.pdf/));
  expect(q.combobox("Find records")).toHaveValue("annual_report.pdf");
  expect(q.listbox.maybe()).not.toBeInTheDocument();
  await press.Backspace(q.combobox(), { ctrlKey: true });
  await type("No matching record");
  expect(q.text("No results found")).toBeVisible();
  expect(q.option.maybe()).not.toBeInTheDocument();
});
