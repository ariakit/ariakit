import { click, q, sleep, waitFor } from "@ariakit/test";

const originalWarn = console.warn;
const warn = vi.fn<typeof console.warn>();

console.warn = warn;

afterEach(() => {
  warn.mockClear();
});

afterAll(() => {
  console.warn = originalWarn;
});

test("doesn't warn when the provider component is passed as store", async () => {
  await click(q.button("Show combobox"));
  await waitFor(() => expect(q.button("Apple")).toBeVisible());
  await sleep(0);
  expect(warn).not.toHaveBeenCalled();
});
