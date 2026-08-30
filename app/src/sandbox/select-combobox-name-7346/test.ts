import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

for (const label of [
  "Select unnamed",
  "Select named",
  "Combobox unnamed",
  "Combobox named",
]) {
  // https://github.com/ariakit/ariakit/issues/7346
  test(`${label} keeps popup state when name changes`, async () => {
    await click(q.combobox(label));
    const dialog = q.dialog(label);
    expect(dialog).toBeVisible();
    await type("Buy ripe fruit", q.textbox("Note"));
    await click(q.button("Add attachment"));
    expect(q.status("Attachments")).toHaveTextContent("Attachments: 1");

    for (const included of [
      label.endsWith(" unnamed"),
      !label.endsWith(" unnamed"),
    ]) {
      await click(q.checkbox(`Include ${label}`));
      expect(q.checkbox(`Include ${label}`)).toHaveProperty(
        "checked",
        included,
      );
      expect(q.textbox("Note")).toHaveValue("Buy ripe fruit");
      expect(q.status("Attachments")).toHaveTextContent("Attachments: 1");
      expect(q.dialog(label)).toBe(dialog);
      await click(q.button(`Submit ${label}`));
      expect(q.status(`${label} submission`)).toHaveTextContent(
        included ? "Apple" : "Omitted",
      );
    }
  });
}
