import {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { defaultValue } from "../utils/misc";
import { StoreOptions } from "../utils/store";

/**
 * Creates a toolbar store.
 */
export function createToolbarStore(
  props: ToolbarStoreProps = {}
): ToolbarStore {
  const syncState = props.store?.getState();

  return createCompositeStore({
    ...props,
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "horizontal" as const
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
  });
}

export interface ToolbarStoreState extends CompositeStoreState {
  /**
   * @default "horizontal"
   */
  orientation: CompositeStoreState["orientation"];
  /**
   * @default true
   */
  focusLoop: CompositeStoreState["focusLoop"];
}

export type ToolbarStoreFunctions = CompositeStoreFunctions;

export interface ToolbarStoreOptions
  extends StoreOptions<ToolbarStoreState, "orientation" | "focusLoop">,
    CompositeStoreOptions {}

export type ToolbarStore = CompositeStore;

export type ToolbarStoreProps = CompositeStoreProps;
