import { click, q, sleep, waitFor } from "@ariakit/test";
import { render } from "@ariakit/test/react";
import { createElement } from "react";
import Example from "./index.react.tsx";

const message =
  "CompositeItem is reading its store from ComboboxProvider implicitly. " +
  "This is deprecated and will stop working in a future version. " +
  "Pass `store={ComboboxProvider}` to keep the current behavior.";

test("warns on implicit compatible provider context", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { unmount } = await render(createElement(Example), {
    strictMode: true,
  });
  try {
    await click(q.button("Show combobox"));
    await waitFor(() => expect(q.button("Apple")).toBeVisible());
    await sleep(0);
    expect(warn).toHaveBeenCalledWith(message);
  } finally {
    unmount();
    warn.mockRestore();
  }
});
