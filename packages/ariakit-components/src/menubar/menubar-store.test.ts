import { expect, test } from "vitest";
import { createMenubarStore } from "./menubar-store.ts";

test("reflects navigation state updates before initialization", () => {
  const store = createMenubarStore();

  store.setActiveId("file");
  expect(store.getState().activeId).toBe("file");

  store.move("edit");
  expect(store.getState().activeId).toBe("edit");
  expect(store.getState().moves).toBe(1);
});
