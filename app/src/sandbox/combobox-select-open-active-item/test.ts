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

for (const label of [
  "Dismissible status",
  "Multiple dismissible status",
  "Real-focus dismissible status",
]) {
  describe(label, () => {
    const realFocus = label.startsWith("Real-focus");
    const opens = [
      { name: "click", open: () => click(q.combobox(label)) },
      {
        name: "Enter",
        open: async () => {
          await focus(q.combobox(label));
          await press.Enter();
        },
      },
      {
        name: "ArrowDown",
        open: async () => {
          await focus(q.combobox(label));
          await press.ArrowDown();
        },
      },
    ];

    for (const { name, open } of opens) {
      // https://github.com/ariakit/ariakit/issues/7626
      test(`arrow keys move through the items after opening with ${name} and nothing selected`, async () => {
        const select = q.combobox(label);
        await open();

        // The dismiss button comes before the list, so it's the popup's first
        // tabbable element.
        expect(q.dialog(`${label} options`)).toBeVisible();
        expect(select).toHaveFocus();
        expect(activeText(label)).toBeUndefined();

        await press.ArrowDown();
        const listbox = q.listbox(`${label} options`);
        const draft = q.within(listbox).option("Draft");
        expect(draft).toHaveAttribute("data-active-item");
        expect(realFocus ? draft : select).toHaveFocus();

        await press("p");
        const published = q.within(listbox).option("Published");
        expect(published).toHaveAttribute("data-active-item");
        expect(realFocus ? published : select).toHaveFocus();
      });
    }
  });
}

// https://github.com/ariakit/ariakit/issues/7626
test("Portal status opens without an active item when nothing is selected", async () => {
  const select = q.combobox("Portal status");
  await click(select);

  expect(q.listbox("Portal status")).toBeVisible();
  expect(select).toHaveFocus();
  expect(activeText("Portal status")).toBeUndefined();

  await press.ArrowDown();
  expect(activeText("Portal status")).toBe("Draft");
});

// https://github.com/ariakit/ariakit/issues/7626
test("Real-focus multiple status keeps the item that typeahead activated before opening", async () => {
  const select = q.combobox("Real-focus multiple status");
  await focus(select);
  await press("p");
  expect(select).toHaveFocus();

  await press.Enter();
  const listbox = q.listbox("Real-focus multiple status");
  const published = q.within(listbox).option("Published");
  expect(published).toHaveFocus();
  expect(published).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  const archived = q.within(listbox).option("Archived");
  expect(archived).toHaveFocus();
  expect(archived).toHaveAttribute("data-active-item");
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

// https://github.com/ariakit/ariakit/issues/7612
test("Managed vegetable popup opened with ArrowDown focuses its autoFocus element", async () => {
  await focus(q.combobox("Managed vegetable"));
  // The arrow key that opens the popup also counts as a move, which must not
  // pass for a move made in the open popup.
  await press.ArrowDown();

  const listbox = q.listbox("Managed vegetable");
  expect(listbox).toHaveAttribute("data-placing");

  await click(q.button("Finish managed vegetable positioning"));
  expect(listbox).not.toHaveAttribute("data-placing");
  expect(q.within(listbox).button("Manage vegetables")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7612
test("Managed vegetable move made while the popup is positioning wins over its autoFocus element", async () => {
  const select = q.combobox("Managed vegetable");
  await click(select);

  const listbox = q.listbox("Managed vegetable");
  expect(listbox).toHaveAttribute("data-placing");

  await press("c");
  expect(activeText("Managed vegetable")).toBe("Carrot");

  await click(q.button("Finish managed vegetable positioning"));
  expect(listbox).not.toHaveAttribute("data-placing");
  expect(select).toHaveFocus();
  expect(activeText("Managed vegetable")).toBe("Carrot");
});

// https://github.com/ariakit/ariakit/issues/7626
test("Empty managed vegetable popup focuses its autoFocus element with nothing selected", async () => {
  const select = q.combobox("Empty managed vegetable");
  await click(select);

  const listbox = q.listbox("Empty managed vegetable");
  expect(listbox).toHaveAttribute("data-placing");
  expect(select).toHaveFocus();

  await click(q.button("Finish empty managed vegetable positioning"));
  expect(listbox).not.toHaveAttribute("data-placing");
  expect(q.within(listbox).button("Manage empty vegetables")).toHaveFocus();
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

  // The popup mounts only once it opens, after the select has recorded the
  // moves made before it opened.
  const listbox = q.listbox("Unmounted vegetable");
  expect(listbox).toHaveAttribute("data-placing");

  await press("c");
  expect(activeText("Unmounted vegetable")).toBe("Carrot");

  await click(q.button("Finish unmounted vegetable positioning"));
  expect(listbox).not.toHaveAttribute("data-placing");
  expect(select).toHaveFocus();
  expect(activeText("Unmounted vegetable")).toBe("Carrot");
});

// https://github.com/ariakit/ariakit/issues/7612
test("Dismissible vegetable move made while the popup is positioning keeps focus in the list", async () => {
  const select = q.combobox("Dismissible vegetable");
  await click(select);

  // The dismiss button comes before the list, so it's the popup's first
  // tabbable element.
  const dialog = q.dialog("Dismissible vegetable options");
  expect(dialog).toHaveAttribute("data-placing");

  await press("c");
  expect(activeText("Dismissible vegetable")).toBe("Carrot");

  await click(q.button("Finish dismissible vegetable positioning"));
  expect(dialog).not.toHaveAttribute("data-placing");
  expect(select).toHaveFocus();
  expect(activeText("Dismissible vegetable")).toBe("Carrot");

  await press.ArrowDown();
  expect(activeText("Dismissible vegetable")).toBe("Garlic");
});

// https://github.com/ariakit/ariakit/issues/7612
test("Real-focus dismissible vegetable move made while the popup is positioning keeps focus in the list", async () => {
  await click(q.combobox("Real-focus dismissible vegetable"));

  // The dismiss button comes before the list, so it's the popup's first
  // tabbable element.
  const dialog = q.dialog("Real-focus dismissible vegetable options");
  expect(dialog).toHaveAttribute("data-placing");

  await press("c");
  const listbox = q.listbox("Real-focus dismissible vegetable options");
  const carrot = q.within(listbox).option("Carrot");
  expect(carrot).toHaveAttribute("data-active-item");

  await click(q.button("Finish real-focus dismissible vegetable positioning"));
  expect(dialog).not.toHaveAttribute("data-placing");
  expect(carrot).toHaveFocus();
  expect(carrot).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  const garlic = q.within(listbox).option("Garlic");
  expect(garlic).toHaveFocus();
  expect(garlic).toHaveAttribute("data-active-item");
});

// https://github.com/ariakit/ariakit/issues/7626
test("Multiple dismissible vegetable popup keeps focus in the list when its only selected item is unchecked while positioning", async () => {
  const select = q.combobox("Multiple dismissible vegetable");
  await click(select);

  const dialog = q.dialog("Multiple dismissible vegetable options");
  expect(dialog).toHaveAttribute("data-placing");

  // Nothing is selected by the time the popup takes its initial focus.
  const listbox = q.listbox("Multiple dismissible vegetable options");
  const artichoke = q.within(listbox).option("Artichoke");
  await click(artichoke);
  expect(artichoke).toHaveAttribute("aria-selected", "false");

  await click(q.button("Finish multiple dismissible vegetable positioning"));
  expect(dialog).not.toHaveAttribute("data-placing");
  expect(select).toHaveFocus();

  // In happy-dom, no item is active once the popup has taken its initial focus,
  // so only the browser test asserts the item that the arrow key moves to.
  await press.ArrowDown();
  expect(activeText("Multiple dismissible vegetable")).toBeDefined();
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
