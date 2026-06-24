import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

const shortcuts = [
  { name: "Ctrl+C", options: { ctrlKey: true } },
  { name: "Meta+C", options: { metaKey: true } },
] as const;

function isApplePlatform(platform: string) {
  return /mac|iphone|ipad|ipod/i.test(platform);
}

// See https://github.com/ariakit/ariakit/issues/6297
for (const shortcut of shortcuts) {
  test(`${shortcut.name} on a focused item does not commit inline autocomplete`, async () => {
    const combobox = q.combobox.ensure("Fruit");

    await click(combobox);
    await type("b");
    expect(q.status.ensure()).toHaveTextContent("b");

    await press.ArrowDown();
    const apple = q.option.ensure("Apple");
    expect(apple).toHaveFocus();
    expect(combobox).toHaveValue("Apple");

    await press("c", null, shortcut.options);
    expect(apple).toHaveFocus();
    expect(q.status.ensure()).toHaveTextContent("b");
  });
}

test("paste shortcut on a focused item moves focus to the input", async () => {
  const combobox = q.combobox.ensure("Fruit");
  const applePlatform = isApplePlatform(navigator.platform);
  const options = applePlatform ? { metaKey: true } : { ctrlKey: true };

  await click(combobox);
  await type("b");
  await press.ArrowDown();
  const apple = q.option.ensure("Apple");
  expect(apple).toHaveFocus();

  await press("v", null, options);
  expect(combobox).toHaveFocus();
});
