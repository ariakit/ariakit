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

describe("Vegetable", () => {
  const moves = [
    { name: "Typeahead", move: () => press("c"), item: "Carrot" },
    { name: "ArrowDown", move: () => press.ArrowDown(), item: "Broccoli" },
  ];

  for (const { name, move, item } of moves) {
    // https://github.com/ariakit/ariakit/issues/7612
    test(`${name} move made while the popup is positioning stays active`, async () => {
      const select = q.combobox("Vegetable");
      await click(select);

      // Positioning is held, so the popup hasn't taken its initial focus.
      const listbox = q.listbox("Vegetable");
      expect(listbox).toHaveAttribute("data-placing");
      expect(activeText("Vegetable")).toBe("Artichoke");

      await move();
      expect(activeText("Vegetable")).toBe(item);

      await click(q.button("Finish vegetable positioning"));
      expect(listbox).not.toHaveAttribute("data-placing");
      expect(select).toHaveFocus();
      expect(activeText("Vegetable")).toBe(item);
    });

    // https://github.com/ariakit/ariakit/issues/7612
    test(`${name} move made while the real-focus popup is positioning keeps focus`, async () => {
      await click(q.combobox("Real-focus vegetable"));

      const listbox = q.listbox("Real-focus vegetable");
      expect(listbox).toHaveAttribute("data-placing");

      await move();
      const target = q.within(listbox).option(item);
      expect(target).toHaveFocus();

      await click(q.button("Finish real-focus vegetable positioning"));
      expect(listbox).not.toHaveAttribute("data-placing");
      expect(target).toHaveFocus();
      expect(target).toHaveAttribute("data-active-item");
    });
  }

  // https://github.com/ariakit/ariakit/issues/7612
  test("move made before the popup repositions stays active", async () => {
    const select = q.combobox("Vegetable");
    await click(select);

    const listbox = q.listbox("Vegetable");
    await click(q.button("Finish vegetable positioning"));
    expect(listbox).not.toHaveAttribute("data-placing");
    expect(activeText("Vegetable")).toBe("Artichoke");

    await press.ArrowDown();
    expect(activeText("Vegetable")).toBe("Broccoli");

    await click(q.button("Reposition vegetable popup"));
    expect(listbox).toHaveAttribute("data-placing");

    await click(q.button("Finish vegetable positioning"));
    expect(listbox).not.toHaveAttribute("data-placing");
    expect(select).toHaveFocus();
    expect(activeText("Vegetable")).toBe("Broccoli");
  });
});

// https://github.com/ariakit/ariakit/issues/7612
test("Managed vegetable popup focuses its autoFocus element when the user doesn't move", async () => {
  const select = q.combobox("Managed vegetable");
  await click(select);

  const listbox = q.listbox("Managed vegetable");
  expect(listbox).toHaveAttribute("data-placing");
  expect(select).toHaveFocus();

  await click(q.button("Finish managed vegetable positioning"));
  expect(listbox).not.toHaveAttribute("data-placing");
  expect(q.within(listbox).button("Manage vegetables")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/pull/7614#discussion_r4082271058
test("Store-prop vegetable move made while the popup is positioning stays active", async () => {
  const select = q.combobox("Store-prop vegetable");
  await click(select);

  const listbox = q.listbox("Store-prop vegetable");
  expect(listbox).toHaveAttribute("data-placing");

  await press("c");
  expect(activeText("Store-prop vegetable")).toBe("Carrot");

  await click(q.button("Finish store-prop vegetable positioning"));
  expect(listbox).not.toHaveAttribute("data-placing");
  expect(select).toHaveFocus();
  expect(activeText("Store-prop vegetable")).toBe("Carrot");
});

// https://github.com/ariakit/ariakit/issues/7612
test("Unmounted vegetable move made while the popup is positioning stays active", async () => {
  const select = q.combobox("Unmounted vegetable");
  await click(select);

  // The popup mounts only once it opens, so this also covers a popover that
  // starts tracking movement after the popup is already open.
  const listbox = q.listbox("Unmounted vegetable");
  expect(listbox).toHaveAttribute("data-placing");

  await press("c");
  expect(activeText("Unmounted vegetable")).toBe("Carrot");

  await click(q.button("Finish unmounted vegetable positioning"));
  expect(listbox).not.toHaveAttribute("data-placing");
  expect(select).toHaveFocus();
  expect(activeText("Unmounted vegetable")).toBe("Carrot");
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
