// @vitest-environment node

import { expect, test, vi } from "vitest";
import { createNotificationStore } from "./notification-store.ts";

test("warns and leaves the store unchanged when pushed during SSR", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(typeof document).toBe("undefined");
  const store = createNotificationStore({
    defaultItems: [{ id: "n1", message: "Restored", createdAt: 0 }],
  });

  expect(store.push("Ignored")).toBe("n2");
  expect(store.push({ id: "authored", message: "Also ignored" })).toBe(
    "authored",
  );
  store.announce("Also ignored");

  expect(store.getState().items).toEqual([
    { id: "n1", message: "Restored", createdAt: 0 },
  ]);
  expect(consoleWarn).toHaveBeenCalledTimes(1);
  expect(consoleWarn).toHaveBeenCalledWith(
    "Notifications cannot be pushed during server rendering.",
  );
});
