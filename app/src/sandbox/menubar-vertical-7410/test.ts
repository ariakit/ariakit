import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

for (const rtl of [false, true]) {
  // https://github.com/ariakit/ariakit/issues/7410
  test(`opens and closes vertical menubar menus with arrow keys (rtl=${rtl})`, async () => {
    if (rtl) {
      await click(q.checkbox("Right to left"));
    }
    await focus(q.menuitem("File"));
    await press.ArrowDown();
    expect(q.menuitem("Edit")).toHaveFocus();
    await press.ArrowUp();
    expect(q.menuitem("File")).toHaveFocus();
    expect(q.menu.all()).toHaveLength(0);
    await press(rtl ? "ArrowLeft" : "ArrowRight");
    expect(q.menuitem("New")).toHaveFocus();
    expect(q.menuitem("File")).toHaveAttribute("aria-expanded", "true");
    await press(rtl ? "ArrowRight" : "ArrowLeft");
    expect(q.menuitem("File")).toHaveFocus();
    expect(q.menu.all()).toHaveLength(0);
    expect(q.menuitem("File")).toHaveAttribute("aria-expanded", "false");
  });

  // https://github.com/ariakit/ariakit/issues/7410
  test(`updates opening keys when switching menubar stores (rtl=${rtl})`, async () => {
    if (rtl) {
      await click(q.checkbox("Right to left"));
    }
    await click(q.checkbox("Horizontal menubar"));
    await focus(q.menuitem("File"));
    await press.ArrowDown();
    expect(q.menuitem("New")).toHaveFocus();
    await press.Escape();
    expect(q.menuitem("File")).toHaveFocus();
    await click(q.checkbox("Horizontal menubar"));
    await focus(q.menuitem("File"));
    await press(rtl ? "ArrowLeft" : "ArrowRight");
    expect(q.menuitem("New")).toHaveFocus();
    await press(rtl ? "ArrowRight" : "ArrowLeft");
    expect(q.menuitem("File")).toHaveFocus();
    expect(q.menu.all()).toHaveLength(0);
  });
}
