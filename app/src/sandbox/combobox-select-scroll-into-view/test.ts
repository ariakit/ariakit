import { click, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

// https://github.com/ariakit/ariakit/issues/6858
test("presents the selection when its item registers late", async () => {
  using scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
  await click(q.combobox("Late items"));
  expect(q.option("Item 24")).not.toBeInTheDocument();

  await expect
    .poll(q.option.lazy("Item 24"), { timeout: 3000 })
    .toBeInTheDocument();
  const selected = q.option.ensure("Item 24");
  expect(selected).toHaveAttribute("data-active-item");
  await expect.poll(() => scrollIntoView.mock.instances).toContain(selected);
});
