import { click, press, q, type } from "@ariakit/test";
import { describe, expect, test } from "vitest";

const cases = [
  ["Provider favorite fruit", "Search provider fruits"],
  ["Store favorite fruit", "Search store fruits"],
] as const;

describe.each(cases)("%s", (label, searchLabel) => {
  test("opens and closes with the pointer and keyboard", async () => {
    const select = q.combobox(label);
    expect(q.dialog.maybe(label)).not.toBeInTheDocument();

    await click(select);
    expect(q.dialog(label)).toBeVisible();
    expect(q.listbox(label)).toBeVisible();
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("Apple")).toHaveFocus();

    await click(select);
    expect(q.dialog.maybe(label)).not.toBeInTheDocument();
    expect(select).toHaveFocus();

    await press.Enter();
    expect(q.dialog(label)).toBeVisible();
    expect(q.combobox(searchLabel)).toHaveFocus();
    await press.ShiftTab();
    expect(select).toHaveFocus();
    await press.Enter();
    expect(q.dialog.maybe(label)).not.toBeInTheDocument();
  });

  test("filters, commits, and restores the selected item", async () => {
    const select = q.combobox(label);
    await click(select);
    await type("gr");
    expect(q.combobox(searchLabel)).toHaveValue("gr");
    expect(q.option("Grape")).toHaveFocus();
    await press.ArrowDown();
    await press.Enter();
    expect(select).toHaveTextContent("Green apple");

    await press.Enter();
    expect(q.combobox(searchLabel)).toHaveValue("");
    expect(q.option("Green apple")).toHaveFocus();
    await type("o");
    expect(q.option("Onion")).toHaveFocus();
  });

  test("resets filtering and focus when reopened", async () => {
    const select = q.combobox(label);
    await click(select);
    await type("f");
    expect(q.option("Fish")).toHaveFocus();
    await press.Escape();
    expect(select).toHaveFocus();

    await press.Enter();
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.combobox(searchLabel)).toHaveValue("");
    expect(q.option("Apple")).toHaveFocus();
  });

  test("auto-selects while the search input owns focus", async () => {
    await click(q.combobox(label));
    await type("p");
    expect(q.option("Pasta")).toHaveFocus();
    await type("i");
    expect(q.option("Pineapple")).toHaveFocus();
  });
});
