import { click, focus, press, q } from "@ariakit/test";
import { describe, expect, test } from "vitest";

function activeText(label: string) {
  const id = q.combobox(label)?.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
}

for (const label of ["Mounted fruit", "Unmounted fruit"]) {
  describe(label, () => {
    test("click", async () => {
      await click(q.combobox(label));
      expect(activeText(label)).toBe("Orange");
    });
    test("Enter", async () => {
      await focus(q.combobox(label));
      await press.Enter();
      expect(activeText(label)).toBe("Orange");
    });
    test("Space", async () => {
      await focus(q.combobox(label));
      await press.Space();
      expect(activeText(label)).toBe("Orange");
    });
    test("ArrowDown", async () => {
      await focus(q.combobox(label));
      await press.ArrowDown();
      expect(activeText(label)).toBe("Orange");
    });
    test("ArrowUp", async () => {
      await focus(q.combobox(label));
      await press.ArrowUp();
      expect(activeText(label)).toBe("Orange");
    });
  });
}

describe("Status", () => {
  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3648996674
  test("ArrowDown moves through the items after clicking to open", async () => {
    await click(q.combobox("Status"));
    expect(activeText("Status")).toBeUndefined();

    await press.ArrowDown();
    expect(q.option("Draft")).toHaveAttribute("data-active-item");
    expect(activeText("Status")).toBe("Draft");

    await press.ArrowDown();
    expect(q.option("Published")).toHaveAttribute("data-active-item");
    expect(q.option("Draft")).not.toHaveAttribute("data-active-item");
    expect(activeText("Status")).toBe("Published");

    await press.Enter();
    expect(q.option("Published")).toHaveAttribute("aria-selected", "true");
    expect(q.combobox("Status")).toHaveTextContent("Published");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3648996674
  test("ArrowDown moves through the items after opening with Enter", async () => {
    await focus(q.combobox("Status"));
    await press.Enter();
    expect(activeText("Status")).toBeUndefined();

    await press.ArrowDown();
    expect(activeText("Status")).toBe("Draft");

    await press.ArrowDown();
    expect(activeText("Status")).toBe("Published");

    await press.ArrowUp();
    expect(activeText("Status")).toBe("Draft");
  });
});

for (const label of ["No-autofocus status", "Real-focus status"]) {
  // https://github.com/ariakit/ariakit/pull/6832
  test(`${label} moves from the focused select`, async () => {
    const select = q.combobox(label);
    await click(select);
    expect(select).toHaveFocus();

    const listbox = q.listbox(`${label} options`);
    expect(q.within(listbox).option("Draft")).toHaveAttribute(
      "data-active-item",
    );

    await press.ArrowDown();
    expect(q.within(listbox).option("Published")).toHaveAttribute(
      "data-active-item",
    );

    await press.ArrowUp();
    expect(q.within(listbox).option("Draft")).toHaveAttribute(
      "data-active-item",
    );
  });
}
