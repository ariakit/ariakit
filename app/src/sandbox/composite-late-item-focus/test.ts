import { click, focus, press, q, sleep } from "@ariakit/test";
import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

// https://github.com/ariakit/ariakit/pull/6832
test("does not refocus a late item after focus leaves the composite", async () => {
  await focus(q.button("First"));
  await press.ArrowDown();

  const mount = q.button.ensure("Mount late items");
  await click(mount);

  expect(mount).toHaveFocus();
  expect(q.button("Late")).not.toHaveFocus();
});

test("only focuses the latest item after rapid unresolved moves", async () => {
  await focus(q.button("First"));
  await press.ArrowDown();
  await press.ArrowDown();

  // Mount without moving focus out of the composite so the pending retry can
  // still focus the latest unresolved item.
  q.button.ensure("Mount late items").click();
  await sleep();

  expect(q.button("Late")).not.toHaveFocus();
  expect(q.button("Later")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6986
test("presents a late virtual-focus item without losing base focus", async () => {
  const composite = q.listbox("Late virtual scroll actions");
  const scrollIntoView = vi
    .spyOn(HTMLElement.prototype, "scrollIntoView")
    .mockImplementation(() => {});
  await focus(composite);

  // Mount without moving focus so the pending presentation still owns the
  // composite when the active item registers.
  q.button.ensure("Mount late virtual scroll item").click();
  await sleep();

  const item = q.option.ensure("Late virtual scroll item");
  expect(item).toHaveAttribute("data-active-item");
  expect(composite).toHaveFocus();
  expect(composite).toHaveAttribute("aria-activedescendant", item.id);
  expect(scrollIntoView.mock.instances).toContain(item);
  expect(scrollIntoView).toHaveBeenCalledWith({
    block: "nearest",
    inline: "nearest",
  });
});
