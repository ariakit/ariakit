import { click, q } from "@ariakit/test";
import { beforeEach, describe, expect, test } from "vitest";

// Registered by the consolidated test entry point.
describe("select-combobox-6313", () => {
  beforeEach(async () => {
    await click(q.button("Show select-combobox-6313"));
  });

  // https://github.com/ariakit/ariakit/issues/6313
  test("keeps hoisted and provider select values in sync after init", () => {
    expect(q.combobox("Favorite fruit")).toHaveTextContent("Banana");
    expect(q.status()).toHaveTextContent("Banana");
  });
});
