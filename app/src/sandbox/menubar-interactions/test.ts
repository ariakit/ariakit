import { click, hover, press, q, sleep, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("show/hide on click", async () => {
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  await click(q.menuitem("File"));
  expect(q.menu("File")).toBeVisible();
  expect(q.menu("File")).toHaveFocus();
  expect(q.menuitem("New Tab")).not.toHaveFocus();
  await click(q.menuitem("New Tab"));
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
  await click(q.menuitem("File"));
  await click(q.menuitem("File"));
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
});

test("show/hide on enter", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("New Tab")).toHaveFocus();
  await press.Enter();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
  await press.Enter();
  await press.ShiftTab();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("File")).toHaveFocus();
  await press.Enter();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
});

test("show/hide on space", async () => {
  await press.Tab();
  await press.Space();
  expect(q.menu("File")).toBeVisible();
  await expect.poll(q.menuitem.lazy("New Tab")).toHaveFocus();
  await press.Space();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
  await press.Space();
  await press.ShiftTab();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("File")).toHaveFocus();
  await press.Space();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
});

test("show/hide on key down", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("New Tab")).toHaveFocus();
  await press.ArrowRight();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menu("Edit")).toBeInTheDocument();
  expect(q.menu("Edit")).toBeVisible();
  expect(q.menuitem("Edit")).toHaveFocus();
  await press.ArrowUp();
  expect(q.menuitem("Emoji & Symbols")).toHaveFocus();
  await press.ArrowLeft();
  await press.ArrowRight();
  await press.ArrowUp();
  expect(q.menuitem("Emoji & Symbols")).toHaveFocus();
  await type("f");
  expect(q.menuitem("Find")).toHaveFocus();
  expect(q.menu.maybe("Find")).not.toBeInTheDocument();
  await press.ArrowRight();
  expect(q.menu("Find")).toBeInTheDocument();
  expect(q.menu("Find")).toBeVisible();
  expect(q.menuitem("Search the Web")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.menuitem("Find")).toHaveFocus();
  expect(q.menu.maybe("Find")).not.toBeInTheDocument();
  await press.ArrowRight();
  await press.ArrowRight();
  expect(q.menuitem("View")).toHaveFocus();
  expect(q.menu("View")).toBeInTheDocument();
  expect(q.menu("View")).toBeVisible();
  await press.ArrowDown();
  expect(q.menuitem("Force Reload This Page")).toHaveFocus();
  await press.ArrowRight();
  expect(q.menuitem("File")).toHaveFocus();
  expect(q.menu("File")).toBeVisible();
});

test("typeahead from menu button continues after focus moves to menu", async () => {
  await press.Tab();
  await press.Enter();
  await press.ShiftTab();

  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("File")).toHaveFocus();

  await type("s");
  expect(q.menuitem("Save Page As")).toHaveFocus();

  await type("h");
  expect(q.menuitem("Share")).toHaveFocus();
});

test("show/hide on hover", async () => {
  await hover(q.menuitem("File"));
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  await click(q.menuitem("File"));
  expect(q.menu("File")).toBeVisible();
  await hover(q.menuitem("New Window"));
  expect(q.menu("File")).toHaveFocus();
  await hover(q.menuitem("View"));
  expect(q.menuitem("View")).toHaveFocus();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  expect(q.menu("View")).toBeVisible();
  await hover(q.menuitem("Developer"));
  await hover(await q.menuitem.wait("View Source"));
  await hover(q.menuitem("File"));
  expect(q.menu("File")).toBeVisible();
  expect(q.menu.maybe("View")).not.toBeInTheDocument();
});

test("hide on escape", async () => {
  await press.Tab();
  await press.Enter();
  await type("sh");
  expect(q.menuitem("Share")).toHaveFocus();
  await sleep(600);
  await press.Space();
  await expect.poll(q.menuitem.lazy("Email Link")).toHaveFocus();
  await press.Escape();
  expect(q.menuitem("File")).toHaveFocus();
  expect(q.menu.maybe("Share")).not.toBeInTheDocument();
  expect(q.menu.maybe("File")).not.toBeInTheDocument();
  await press.ArrowRight();
  expect(q.menuitem("Edit")).toHaveFocus();
  expect(q.menu.maybe("Edit")).not.toBeInTheDocument();
  await press.Escape();
  await hover(q.menuitem("View"));
  expect(q.menu.maybe("View")).not.toBeInTheDocument();
});

for (const name of ["Search", "Rename", "Nested search", "Search blocks"]) {
  for (const key of ["ArrowRight", "ArrowLeft"] as const) {
    // https://github.com/ariakit/ariakit/issues/7409
    test(`${key} moves the caret in ${name}`, async () => {
      const menuName = name === "Search blocks" ? "Insert" : "Tools";
      await click(q.menuitem(menuName));
      const popup =
        name === "Search blocks" ? q.dialog(menuName) : q.menu(menuName);
      const input = q.labeled(name) as HTMLInputElement;
      await click(input);
      input.setSelectionRange(1, 1);
      expect(input).toHaveFocus();
      expect(popup).toBeVisible();
      await press[key]();
      expect(input).toHaveFocus();
      expect(popup).toBeVisible();
      const position = key === "ArrowRight" ? 2 : 0;
      expect(input.selectionStart).toBe(position);
      expect(input.selectionEnd).toBe(position);
      await press.Escape();
      expect(popup).not.toBeVisible();
      expect(q.menuitem(menuName)).toHaveFocus();
    });
  }
}

// https://github.com/ariakit/ariakit/issues/7409
test("ArrowLeft edits a field in a submenu without closing it", async () => {
  await click(q.menuitem("Tools"));
  await click(q.menuitem("More options"));
  const input = q.textbox("Filter") as HTMLInputElement;
  await click(input);
  input.setSelectionRange(1, 1);
  expect(input).toHaveFocus();
  expect(q.menu("More options")).toBeVisible();
  await press.ArrowLeft();
  expect(input).toHaveFocus();
  expect(input.selectionStart).toBe(0);
  expect(q.menu("More options")).toBeVisible();
});

for (const key of ["ArrowRight", "ArrowLeft"] as const) {
  for (const target of ["menu", "item", "input edge"]) {
    // https://github.com/ariakit/ariakit/issues/7409
    test(`${key} traverses the menubar from ${target}`, async () => {
      await click(q.menuitem("Tools"));
      if (target === "item") {
        await press.ArrowDown();
        expect(q.menuitem("New document")).toHaveFocus();
      } else if (target === "input edge") {
        const input = q.menuitem("Rename") as HTMLInputElement;
        await click(input);
        const position = key === "ArrowRight" ? 3 : 0;
        input.setSelectionRange(position, position);
        expect(input).toHaveFocus();
      } else {
        expect(q.menu("Tools")).toHaveFocus();
      }
      await press[key]();
      const next = key === "ArrowRight" ? "Format" : "Insert";
      expect(q.menuitem(next)).toHaveFocus();
      expect(q.menu.maybe("Tools")).not.toBeInTheDocument();
      expect(next === "Format" ? q.menu(next) : q.dialog(next)).toBeVisible();
    });
  }
}

for (const key of ["ArrowDown", "ArrowUp"] as const) {
  // https://github.com/ariakit/ariakit/issues/7409
  test(`${key} keeps focus on Rename in a vertical menubar`, async () => {
    await click(q.checkbox("Vertical menubar"));
    await click(q.menuitem("Tools"));
    const input = q.menuitem("Rename") as HTMLInputElement;
    await click(input);
    input.setSelectionRange(1, 1);
    expect(input).toHaveFocus();
    expect(q.menu("Tools")).toBeVisible();
    await press[key]();
    expect(input).toHaveFocus();
    expect(q.menu("Tools")).toBeVisible();
  });

  for (const name of ["Help", "Action"]) {
    // https://github.com/ariakit/ariakit/issues/7409
    test(`${key} keeps focus on ${name} in a vertical menubar`, async () => {
      await click(q.checkbox("Vertical menubar"));
      await click(q.menuitem("Tools"));
      const control = name === "Help" ? q.link(name) : q.button(name);
      await click(control);
      expect(control).toHaveFocus();
      expect(q.menu("Tools")).toBeVisible();
      await press[key]();
      expect(control).toHaveFocus();
      expect(q.menu("Tools")).toBeVisible();
    });
  }
}
