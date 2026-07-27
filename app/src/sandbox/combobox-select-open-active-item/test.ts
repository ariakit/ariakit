import { click, focus, hover, press, q } from "@ariakit/test";
import { describe, expect, test } from "vitest";

function activeText(label: string) {
  const id = q.combobox(label)?.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
}

for (const label of ["Mounted fruit", "Unmounted fruit"]) {
  describe(label, () => {
    test("click", async () => {
      await click(q.combobox.ensure(label));
      expect(activeText(label)).toBe("Orange");
    });
    test("Enter", async () => {
      await focus(q.combobox.ensure(label));
      await press.Enter();
      expect(activeText(label)).toBe("Orange");
    });
    test("Space", async () => {
      await focus(q.combobox.ensure(label));
      await press.Space();
      expect(activeText(label)).toBe("Orange");
    });
    test("ArrowDown", async () => {
      await focus(q.combobox.ensure(label));
      await press.ArrowDown();
      expect(activeText(label)).toBe("Orange");
    });
    test("ArrowUp", async () => {
      await focus(q.combobox.ensure(label));
      await press.ArrowUp();
      expect(activeText(label)).toBe("Orange");
    });
  });
}

describe("Status", () => {
  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3648996674
  test("ArrowDown moves through the items after clicking to open", async () => {
    await click(q.combobox.ensure("Status"));
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
    await focus(q.combobox.ensure("Status"));
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
    const select = q.combobox.ensure(label);
    await click(select);
    expect(select).toHaveFocus();

    const listbox = q.listbox.ensure(`${label} options`);
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

// https://github.com/ariakit/ariakit/pull/6832
test("honors focusOnHover on a closed always-visible list", async () => {
  const item = q.option.ensure("Explicit hover second");
  await hover(item);

  expect(item).toHaveAttribute("data-active-item");
});
