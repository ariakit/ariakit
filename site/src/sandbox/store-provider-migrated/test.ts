import { click, q, sleep, waitFor } from "@ariakit/test";

test("doesn't warn when the provider component is passed as store", async () => {
  await click(q.button("Show combobox"));
  await waitFor(() => expect(q.button("Apple")).toBeVisible());
  await sleep(0);
  const warnings = (globalThis as { __allowedConsoleMessages?: string[] })
    .__allowedConsoleMessages;
  expect(warnings).toEqual([]);
});
