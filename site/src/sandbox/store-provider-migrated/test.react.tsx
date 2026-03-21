import { click, q, sleep, waitFor } from "@ariakit/test";

test("doesn't warn when the provider component is passed as store", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  await click(q.button("Show combobox"));
  await waitFor(() => expect(q.button("Apple")).toBeVisible());
  await sleep(0);
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});
