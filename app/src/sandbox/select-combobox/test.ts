import { click, press, q, type } from "@ariakit/test";
import { describe, expect, test } from "vitest";

describe.each([
  ["Provider searchable favorite fruit", "Search provider foods"],
  ["Store searchable favorite fruit", "Search store foods"],
])("%s", (label, searchName) => {
  // examples/select-combobox/test.ts
  // examples/select-combobox-store/test.ts
  test("filters and selects through the combined stores", async () => {
    const select = q.combobox(label);
    await click(select);
    expect(q.combobox(searchName)).toHaveFocus();
    await type("gr");
    expect(q.option("Grape")).toHaveFocus();
    await press.Enter();
    expect(select).toHaveTextContent("Grape");
    expect(q.dialog()).not.toBeInTheDocument();
  });
});
