import { click, q, sleep, waitFor } from "@ariakit/test";

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  return () => {
    warn.mockRestore();
  };
});

test("doesn't warn when the provider component is passed as store", async () => {
  await click(q.button("Show combobox"));
  await waitFor(() => expect(q.button("Apple")).toBeVisible());
  await sleep(0);
  expect(warn).not.toHaveBeenCalled();
});
