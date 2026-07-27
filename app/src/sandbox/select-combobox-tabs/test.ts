import { click, press, q } from "@ariakit/test";
import { describe, expect, test } from "vitest";

describe.each([
  ["Select with Combobox and Tab", true],
  ["Manual tabs", false],
])("%s", (label, selectOnMove) => {
  // examples/select-combobox-tab/test.ts
  // examples/select-combobox-tab-various/test.ts
  test("composes Select, Combobox, and tabs", async () => {
    await click(q.combobox(label));
    expect(q.tab("Branches")).toHaveAttribute("aria-selected", "true");
    await press.ArrowRight();
    expect(q.tab("Tags")).toHaveFocus();
    expect(q.tab("Tags")).toHaveAttribute(
      "aria-selected",
      selectOnMove ? "true" : "false",
    );
    if (!selectOnMove) {
      await press.Enter();
    }
    await click(q.option("v18.2.0"));
    expect(q.combobox(label)).toHaveTextContent("v18.2.0");
  });
});
