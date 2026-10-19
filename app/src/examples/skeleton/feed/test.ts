import { click, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// Each page takes 1.2 seconds to load.
const timeout = 3000;

test("keeps loaded posts visible while more posts load", async () => {
  await expect
    .poll(() => q.text.maybe("Priya Raman"), { timeout })
    .toBeInTheDocument();
  await click(q.button("Load more"));
  expect(q.status()).toHaveTextContent("Loading posts");
  // The next page shows its placeholders 150 ms after the request starts, and
  // no visible state marks that moment. Cross it while the page loads.
  await sleep(250);
  expect(q.status()).toHaveTextContent("Loading posts");
  expect(q.text("Priya Raman")).toBeInTheDocument();
  expect(q.text("Leo Martins")).toBeInTheDocument();
  await expect
    .poll(() => q.text.maybe("Kenji Ito"), { timeout })
    .toBeInTheDocument();
  expect(q.text("Priya Raman")).toBeInTheDocument();
});
