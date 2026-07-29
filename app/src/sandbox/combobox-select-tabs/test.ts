import { click, focus, press, q, type } from "@ariakit/test";
import { describe, expect, test } from "vitest";

const cases = [
  ["Select with Tab", false, false],
  ["Select with Combobox and Tab", true, false],
  ["Select with manual Tab", false, true],
  ["Select with Combobox and manual Tab", true, true],
] as const;

describe.each(cases)("%s", (label, searchable, manual) => {
  test("opens on the selected value and commits another option", async () => {
    const select = q.combobox(label);
    expect(select).toHaveTextContent("main");
    await click(select);
    expect(q.option("main")).toHaveFocus();
    expect(q.option("main")).toHaveAttribute("aria-selected", "true");

    await click(q.option("leg"));
    expect(q.dialog()).not.toBeInTheDocument();
    expect(select).toHaveTextContent("leg");

    await focus(select);
    await press.ArrowDown();
    expect(q.option("leg")).toHaveFocus();
  });

  test("switches tabs with automatic or manual selection", async () => {
    await click(q.combobox(label));
    expect(q.tab("Branches")).toHaveAttribute("aria-selected", "true");
    await press.ArrowRight();
    expect(q.tab("Tags")).toHaveFocus();
    expect(q.tab("Tags")).toHaveAttribute(
      "aria-selected",
      manual ? "false" : "true",
    );
    if (manual) {
      expect(q.tabpanel("Tags")).not.toBeInTheDocument();
      await press.Enter();
    }
    expect(q.tab("Tags")).toHaveAttribute("aria-selected", "true");
    expect(q.tabpanel("Tags")).toBeInTheDocument();
    await press.ArrowDown();
    expect(q.option("v18.2.0")).toHaveFocus();
  });

  test("does not trap focus in the tabbed popover", async () => {
    const target = document.createElement("div");
    target.tabIndex = 0;
    document.body.append(target);

    await click(q.combobox(label));
    await press.ArrowRight();
    expect(q.tab("Tags")).toHaveFocus();
    await press.Tab();
    expect(q.listbox()).toHaveFocus();
    expect(q.dialog()).toBeInTheDocument();
    await press.Tab();
    expect(q.dialog()).not.toBeInTheDocument();

    target.remove();
  });

  if (searchable) {
    test("filters and creates a custom branch", async () => {
      const select = q.combobox(label);
      await click(select);
      await type("cus");
      expect(q.option("fabric-focus-blur")).toHaveFocus();
      expect(q.option("Create branch cus from main")).toBeInTheDocument();

      await type("tom");
      const custom = q.option("Create branch custom from main");
      expect(custom).toHaveFocus();
      await press.Enter();
      expect(q.dialog()).not.toBeInTheDocument();
      expect(select).toHaveTextContent("custom");

      await press.Space();
      expect(q.option("custom")).toHaveFocus();
      expect(q.option("custom")).toHaveAttribute("aria-selected", "true");
    });
  }
});
