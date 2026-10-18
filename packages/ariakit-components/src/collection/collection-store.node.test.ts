// @vitest-environment node
import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createCollectionStore } from "./collection-store.ts";

test("initializes and registers items without a DOM", async () => {
  const store = createCollectionStore();
  const stop = init(store);

  try {
    store.renderItem({ id: "item" });

    await expect
      .poll(() => store.getState().renderedItems.map((item) => item.id))
      .toEqual(["item"]);
  } finally {
    stop();
  }
});
