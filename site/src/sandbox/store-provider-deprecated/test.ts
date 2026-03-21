import { click, q, sleep, waitFor } from "@ariakit/test";

const message =
  "CompositeItem is reading its store from ComboboxProvider implicitly. " +
  "This is deprecated and will stop working in a future version. " +
  "Pass `store={ComboboxProvider}` to keep the current behavior.";

test("warns on implicit compatible provider context", async () => {
  await click(q.button("Show combobox"));
  await waitFor(() => expect(q.button("Apple")).toBeVisible());
  await sleep(0);
  const warnings = (globalThis as { __allowedConsoleMessages?: string[] })
    .__allowedConsoleMessages;
  expect(warnings).toContain(message);
});
