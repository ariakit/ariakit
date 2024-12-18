import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { createCompositeStore } from "../composite/composite-store.ts";
import { defaultValue } from "../utils/misc.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";

/**
 * Creates a toolbar store.
 */
export function createToolbarStore(
  props: ToolbarStoreProps = {},
): ToolbarStore {
  const syncState = props.store?.getState();

  return createCompositeStore({
    ...props,
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "horizontal" as const,
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
  });
}

export interface ToolbarStoreState extends CompositeStoreState {
  /** @default "horizontal" */
  orientation: CompositeStoreState["orientation"];
  /** @default true */
  focusLoop: CompositeStoreState["focusLoop"];
}

export interface ToolbarStoreFunctions extends CompositeStoreFunctions {}

export interface ToolbarStoreOptions
  extends StoreOptions<ToolbarStoreState, "orientation" | "focusLoop">,
    CompositeStoreOptions {}

export interface ToolbarStoreProps
  extends ToolbarStoreOptions,
    StoreProps<ToolbarStoreState> {}

export interface ToolbarStore
  extends ToolbarStoreFunctions,
    Store<ToolbarStoreState> {}
