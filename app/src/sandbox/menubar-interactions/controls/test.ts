import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

for (const name of ["Search", "Rename", "Search blocks"]) {
  for (const key of ["ArrowRight", "ArrowLeft"] as const) {
    // https://github.com/ariakit/ariakit/issues/7409
    test(`${key} moves the caret in ${name}`, async () => {
      const menuName = name === "Search blocks" ? "Insert" : "File";
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

for (const key of ["ArrowDown", "ArrowUp"] as const) {
  for (const name of ["Help", "Action"]) {
    // https://github.com/ariakit/ariakit/issues/7409
    test(`${key} keeps focus on ${name} in a vertical menubar`, async () => {
      await click(q.checkbox("Vertical menubar"));
      await click(q.menuitem("File"));
      const control = name === "Help" ? q.link(name) : q.button(name);
      await click(control);
      expect(control).toHaveFocus();
      expect(q.menu("File")).toBeVisible();
      await press[key]();
      expect(control).toHaveFocus();
      expect(q.menu("File")).toBeVisible();
    });
  }
}
