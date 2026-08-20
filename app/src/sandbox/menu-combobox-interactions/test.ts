import { click, focus, hover, press, q, type } from "@ariakit/test";
import { describe, expect, test } from "vitest";

const cases = [
  ["Provider Add block", "Search provider blocks"],
  ["Store Add block", "Search store blocks"],
] as const;

describe.each(cases)("%s", (buttonLabel, searchLabel) => {
  test("show/hide on click", async () => {
    const button = q.button(buttonLabel);
    expect(q.dialog.maybe(buttonLabel)).not.toBeInTheDocument();
    await click(button);
    expect(q.dialog(buttonLabel)).toBeVisible();
    expect(q.dialog(buttonLabel)).not.toHaveFocus();
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("Paragraph")).not.toHaveFocus();
    await click(button);
    expect(q.dialog.maybe(buttonLabel)).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  test("show/hide on enter", async () => {
    const button = q.button(buttonLabel);
    await focus(button);
    expect(q.dialog.maybe(buttonLabel)).not.toBeInTheDocument();
    await press.Enter();
    expect(q.dialog(buttonLabel)).toBeVisible();
    expect(q.dialog(buttonLabel)).not.toHaveFocus();
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("Paragraph")).toHaveFocus();
    await press.ShiftTab();
    expect(button).toHaveFocus();
    await press.Enter();
    expect(q.dialog.maybe(buttonLabel)).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  test("show/hide on space", async () => {
    const button = q.button(buttonLabel);
    await focus(button);
    await press.Space();
    expect(q.dialog(buttonLabel)).toBeVisible();
    expect(q.dialog(buttonLabel)).not.toHaveFocus();
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("Paragraph")).toHaveFocus();
    await press.ShiftTab();
    expect(button).toHaveFocus();
    await press.Space();
    expect(q.dialog.maybe(buttonLabel)).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  test("show on arrow down", async () => {
    const button = q.button(buttonLabel);
    await focus(button);
    await press.ArrowDown();
    expect(q.dialog(buttonLabel)).toBeVisible();
    expect(q.dialog(buttonLabel)).not.toHaveFocus();
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("Paragraph")).toHaveFocus();
  });

  test("show on arrow up", async () => {
    const button = q.button(buttonLabel);
    await focus(button);
    await press.ArrowUp();
    expect(q.dialog(buttonLabel)).toBeVisible();
    expect(q.dialog(buttonLabel)).not.toHaveFocus();
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("Tag Cloud")).toHaveFocus();
  });

  test("type on combobox", async () => {
    const button = q.button(buttonLabel);
    await click(button);
    await type("c");
    expect(q.option("Classic")).toHaveFocus();
    await type("o");
    expect(q.option.maybe("Classic")).not.toBeInTheDocument();
    expect(q.option("Code")).toHaveFocus();
    await type("ver");
    expect(q.combobox(searchLabel)).toHaveValue("cover");
    expect(q.option.maybe("Code")).not.toBeInTheDocument();
    expect(q.option("Cover")).toHaveFocus();
    await press.Escape();
    expect(button).toHaveFocus();
    await click(button);
    expect(q.combobox(searchLabel)).toHaveValue("");
  });

  test("backspace on combobox", async () => {
    const button = q.button(buttonLabel);
    await focus(button);
    await press.Enter();
    expect(q.option("Paragraph")).toHaveFocus();
    await type("g");
    expect(q.option("Gallery")).toHaveFocus();
    await type("r");
    expect(q.option("Group")).toHaveFocus();
    await type("\b");
    expect(q.combobox(searchLabel)).toHaveValue("g");
    expect(q.option("Gallery")).toHaveFocus();
    await type("\b");
    expect(q.combobox(searchLabel)).toHaveValue("");
    expect(q.option("Paragraph")).toHaveFocus();
  });

  test("move through items with keyboard", async () => {
    const button = q.button(buttonLabel);
    await focus(button);
    await press.ArrowDown();
    expect(q.option("Paragraph")).toHaveFocus();
    await press.ArrowDown();
    expect(q.option("Heading")).toHaveFocus();
    await press.ArrowDown();
    expect(q.option("List")).toHaveFocus();
    await type("se");
    expect(q.option("Separator")).toHaveFocus();
    await press.ArrowDown();
    expect(q.option("Search")).toHaveFocus();
    await press.ArrowDown();
    expect(q.option("Verse")).toHaveFocus();
    await press.Escape();
    await press.ArrowDown();
    expect(q.option("Paragraph")).toHaveFocus();
  });

  test("move through items with mouse and keyboard", async () => {
    const button = q.button(buttonLabel);
    await click(button);
    await press.ArrowDown();
    expect(q.option("Paragraph")).toHaveFocus();
    expect(q.option("Paragraph")).toHaveAttribute("data-focus-visible");
    await hover(q.option("List"));
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("List")).toHaveFocus();
    expect(q.option("List")).not.toHaveAttribute("data-focus-visible");
    await hover(q.option("Classic"));
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("Classic")).toHaveFocus();
    expect(q.option("Classic")).not.toHaveAttribute("data-focus-visible");
    await press.ArrowUp();
    expect(q.combobox(searchLabel)).toHaveFocus();
    expect(q.option("Quote")).toHaveFocus();
    expect(q.option("Quote")).toHaveAttribute("data-focus-visible");
  });
});
