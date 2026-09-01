import type * as Core from "@ariakit/components/composite/composite-store";
import { sync } from "@ariakit/store";

interface MoveRequest {
  /**
   * The `CompositeFocusOnMove` instance that consumed the current move, or
   * `null` while none has.
   */
  consumedBy: object | null;
  targetId: Core.CompositeStoreState["activeId"];
}

/**
 * Tracks the current move per store. This has to outlive the component:
 * `moves` only counts requests, so a fresh instance can't tell whether a move
 * was consumed or what target a pending move asked for.
 */
const moveRequests = new WeakMap<Core.CompositeStore["item"], MoveRequest>();

export function getMoveRequest(store: Core.CompositeStore) {
  // Store hooks can return wrapper objects that share the same core store.
  const key = store.item;
  const cached = moveRequests.get(key);
  if (cached) return cached;
  const request: MoveRequest = {
    consumedBy: null,
    targetId: store.getState().activeId,
  };
  moveRequests.set(key, request);
  sync(store, ["moves", "activeId"], (state, prevState) => {
    if (state.moves !== prevState.moves) {
      request.consumedBy = null;
      request.targetId = state.activeId;
      return;
    }
    if (state.activeId !== prevState.activeId) {
      // `move` writes `activeId` before `moves`, so its count update replaces
      // this cancellation with the requested target.
      request.targetId = undefined;
    }
  });
  return request;
}
