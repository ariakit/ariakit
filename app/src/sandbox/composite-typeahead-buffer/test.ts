import { dispatch, press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

function typeahead(key: string) {
  const activeElement = document.activeElement;
  if (!activeElement) throw new Error("No active element");
  return dispatch.keyDown(activeElement, {
    bubbles: true,
    cancelable: true,
    key,
  });
}

test("keeps typeahead characters scoped to each composite instance", async () => {
  await press.Tab();

  vi.useFakeTimers();

  try {
    expect(q.button("Alpha")).toHaveFocus();

    await typeahead("a");
    expect(q.button("Alpine")).toHaveFocus();

    await typeahead("p");
    expect(q.button("Apricot")).toHaveFocus();

    q.button.ensure("Cherry").focus();
    expect(q.button("Cherry")).toHaveFocus();

    await typeahead("b");
    expect(q.button("Banana")).toHaveFocus();
  } finally {
    vi.useRealTimers();
  }
});
