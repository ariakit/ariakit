/**
 * Undo and redo manager utilities.
 * @module Undo utilities
 */

type Callback = void | (() => Callback | Promise<Callback>);

interface CreateUndoManagerOptions {
  limit?: number;
}

function createUndoCallback(callback: Callback) {
  return async () => {
    const redo = await callback?.();
    return createUndoCallback(async () => {
      await redo?.();
      return callback;
    });
  };
}

/**
 * Shared undo manager instance.
 */
export const UndoManager = createUndoManager();

/**
 * Creates an undo manager with undo and redo stacks.
 */
export function createUndoManager({
  limit = 100,
}: CreateUndoManagerOptions = {}) {
  const undoStack: Callback[] = [];
  let redoStack: Callback[] = [];
  let currentGroup: string | null = null;

  const canUndo = () => undoStack.length > 0;

  const canRedo = () => redoStack.length > 0;

  const undo = async () => {
    if (!canUndo()) return;
    currentGroup = null;
    redoStack.push(await undoStack.pop()?.());
  };

  const redo = async () => {
    if (!canRedo()) return;
    currentGroup = null;
    undoStack.push(await redoStack.pop()?.());
  };

  const execute = async (callback: Callback, group?: string) => {
    if (!callback) return;

    const sameGroup = group === currentGroup;
    currentGroup = group ?? null;

    const nextIndex = sameGroup
      ? Math.max(0, undoStack.length - 1)
      : undoStack.length;

    const undoCallback = await callback();
    if (!undoCallback) return;
    redoStack = [];

    const currentUndo = undoStack[nextIndex];

    undoStack[nextIndex] = createUndoCallback(async () => {
      await undoCallback?.();
      const currentRedo = await currentUndo?.();
      return async () => {
        await currentRedo?.();
        await callback?.();
      };
    });

    while (undoStack.length > limit) {
      undoStack.shift();
    }
  };

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    execute,
  };
}
