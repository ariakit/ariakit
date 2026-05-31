import { expect, test } from "vitest";
import { createUndoManager } from "./undo.ts";

function createUndoableAction(log: string[], value: string) {
  return () => {
    log.push(`do:${value}`);
    return () => {
      log.push(`undo:${value}`);
    };
  };
}

test("clears the redo stack after executing a new action", async () => {
  const log: string[] = [];
  const manager = createUndoManager();

  await manager.execute(createUndoableAction(log, "one"));
  await manager.undo();
  expect(manager.canRedo()).toBe(true);

  await manager.execute(createUndoableAction(log, "two"));

  expect(manager.canRedo()).toBe(false);
  await manager.redo();
  expect(log).toEqual(["do:one", "undo:one", "do:two"]);
});

test("groups consecutive actions under the same group", async () => {
  const log: string[] = [];
  const manager = createUndoManager();

  await manager.execute(createUndoableAction(log, "one"), "group");
  await manager.execute(createUndoableAction(log, "two"), "group");

  expect(manager.canUndo()).toBe(true);

  await manager.undo();

  expect(manager.canUndo()).toBe(false);
  expect(manager.canRedo()).toBe(true);
  expect(log).toEqual(["do:one", "do:two", "undo:two", "undo:one"]);
});
