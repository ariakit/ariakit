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
  // `move` writes `activeId` before `moves`, so the active id at this point is
  // the target of this request, including moves propagated from another store.
  sync(store, ["moves"], () => {
    request.consumedBy = null;
    request.targetId = store.getState().activeId;
  });
  return request;
}
