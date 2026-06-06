import { expect, test } from "vitest";
import { isBrowser, wrapAsync } from "./__utils.ts";
import "./shims.ts";

test("applies the browser shims at import, for the whole environment", () => {
  if (isBrowser) return;
  const connected = document.createElement("button");
  document.body.append(connected);
  const disconnected = document.createElement("button");
  try {
    // The getClientRects shim reports a 1x1 rect for connected, visible
    // elements even outside a simulated interaction (`wrapAsync`)...
    expect(connected.getClientRects()[0]).toMatchObject({
      width: 1,
      height: 1,
    });
    // ...and an empty list for elements that aren't visible.
    expect(disconnected.getClientRects()).toHaveLength(0);
  } finally {
    connected.remove();
  }
});

test("keeps the browser shims applied after an interaction settles", async () => {
  if (isBrowser) return;
  const element = document.createElement("button");
  document.body.append(element);
  try {
    await wrapAsync(async () => {});
    // The shims are no longer torn down between interactions, so they're still
    // in place once `wrapAsync` returns.
    expect(element.getClientRects()[0]).toMatchObject({ width: 1, height: 1 });
  } finally {
    element.remove();
  }
});
