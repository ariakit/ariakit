import { focus, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

const labels = ["Fruit", "Fruit without virtual focus"];

for (const label of labels) {
  // https://github.com/ariakit/ariakit/issues/7093
  test(`${label}: a collapsed select never focuses its list`, async () => {
    const select = q.combobox.ensure(label);
    const list = q.listbox(`${label} options`);
    const focusedOptions = q.status(`${label} focused options`);

    await focus(select);

    expect(select).toHaveAttribute("aria-expanded", "false");
    // The composite can present its active item from a queued microtask or
    // from a passive effect, and `focus` only flushes microtasks. Cross a
    // macrotask so a presentation has a chance to run before asserting that
    // nothing focused an item.
    await sleep();
    expect(select).toHaveFocus();
    expect(focusedOptions).toHaveTextContent(/^none$/);

    await press("g", select);

    expect(select).toHaveTextContent("Grape");
    expect(q.within(list).option("Grape")).toHaveAttribute("data-active-item");
    expect(select).toHaveFocus();
    expect(select).toHaveAttribute("aria-expanded", "false");
    expect(focusedOptions).toHaveTextContent(/^none$/);

    // Opening the list is what turns its items into focus targets, so this
    // also shows that the recorder fires when an item really is focused.
    await press("ArrowDown", select);

    expect(select).toHaveAttribute("aria-expanded", "true");
    expect(q.within(list).option("Grape")).toHaveAttribute("data-active-item");
    expect(focusedOptions).toHaveTextContent("Grape");
  });
}
