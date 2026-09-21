import type * as Core from "@ariakit/components/composite/composite-store";
import { sync } from "@ariakit/store";

type MoveStore = NonNullable<Core.CompositeStoreProps["store"]>;

const cancelled = Symbol("cancelled");

interface MoveRequest {
  /**
   * The `CompositeFocusOnMove` instance that consumed the current move, or
   * `null` while none has.
   */
  consumedBy: object | null;
  targetId: Core.CompositeStoreState["activeId"] | typeof cancelled;
}

/**
 * Tracks the current move per store. This has to outlive the component: `moves`
 * only counts requests, so a fresh instance can't tell whether a move was
 * consumed or what target a pending move asked for.
 */
const moveRequests = new WeakMap<MoveStore["getState"], MoveRequest>();

export function getMoveRequest(
  store: MoveStore,
  source?: MoveStore,
): MoveRequest {
  // Store hooks can return wrapper objects that share the same core store.
  // oxlint-disable-next-line typescript/unbound-method -- identity key, never called
  const key = store.getState;
  const cached = moveRequests.get(key);
  if (cached) return cached;
  const sourceState = source?.getState();
  if (
    source &&
    sourceState &&
    Object.hasOwn(sourceState, "moves") &&
    Object.hasOwn(sourceState, "activeId")
  ) {
    // Preserve requests across provider remounts. Bind only new core stores:
    // source prop changes take effect after the core store is replaced.
    const request = getMoveRequest(source);
    moveRequests.set(key, request);
    return request;
  }
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
      request.targetId = cancelled;
    }
  });
  return request;
}
