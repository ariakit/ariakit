import { click, q, sleep, waitFor } from "@ariakit/test";
import { render } from "@ariakit/test/react";
import { createElement } from "react";
import Example from "./index.react.tsx";

test("doesn't warn when the provider component is passed as store", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { unmount } = await render(createElement(Example), {
    strictMode: true,
  });
  try {
    await click(q.button("Show combobox"));
    await waitFor(() => expect(q.button("Apple")).toBeVisible());
    await sleep(0);
    expect(warn).not.toHaveBeenCalled();
  } finally {
    unmount();
    warn.mockRestore();
  }
});
