import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6858
test("presents the selection when its item registers late", async () => {
  await click(q.combobox("Late items"));
  const listbox = q.listbox.ensure("Late items options");
  listbox.style.overflowY = "auto";
  const presentedItems: Element[] = [];
  const scrollTops: number[] = [];
  Object.defineProperties(listbox, {
    clientHeight: { configurable: true, value: 120 },
    scrollHeight: { configurable: true, value: 1000 },
    scrollTop: {
      configurable: true,
      get: () => scrollTops.at(-1) ?? 0,
      set: (value) => {
        scrollTops.push(value);
        const activeItem = listbox.querySelector("[data-active-item]");
        if (activeItem) presentedItems.push(activeItem);
      },
    },
  });
  expect(q.option("Item 24")).not.toBeInTheDocument();

  await expect
    .poll(q.option.lazy("Item 24"), { timeout: 3000 })
    .toBeInTheDocument();
  const selected = q.option.ensure("Item 24");
  expect(selected).toHaveAttribute("data-active-item");
  await expect
    .poll(() => presentedItems, { timeout: 3000 })
    .toContain(selected);
});
