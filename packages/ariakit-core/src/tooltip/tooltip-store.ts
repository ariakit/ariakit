import { createHovercardStore } from "../hovercard/hovercard-store.js";
import type {
  HovercardStoreFunctions,
  HovercardStoreOptions,
  HovercardStoreState,
} from "../hovercard/hovercard-store.js";
import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore } from "../utils/store.js";

/**
 * Creates a tooltip store.
 */
export function createTooltipStore(
  props: TooltipStoreProps = {}
): TooltipStore {
  const syncState = props.store?.getState();

  const hovercard = createHovercardStore({
    ...props,
    placement: defaultValue(
      props.placement,
      syncState?.placement,
      "top" as const
    ),
    showTimeout: defaultValue(
      props.showTimeout,
      syncState?.showTimeout,
      props.timeout,
      500
    ),
    hideTimeout: defaultValue(
      props.hideTimeout,
      syncState?.hideTimeout,
      props.timeout,
      0
    ),
  });

  const initialState: TooltipStoreState = {
    ...hovercard.getState(),
    type: defaultValue(props.type, syncState?.type, "description" as const),
    skipTimeout: defaultValue(props.skipTimeout, syncState?.skipTimeout, 300),
  };

  const tooltip = createStore(initialState, hovercard, props.store);

  return {
    ...hovercard,
    ...tooltip,
  };
}

export interface TooltipStoreState extends HovercardStoreState {
  /**
   * Determines whether the tooltip is being used as a label or a description
   * for the anchor element.
   * @default "description"
   */
  type: "label" | "description";
  /**
   * The amount of time after a tooltip is hidden while all tooltips on the
   * page can be shown immediately, without waiting for the show timeout.
   * @default 300
   */
  skipTimeout: number;
  /** @default "top" */
  placement: HovercardStoreState["placement"];
  /** @default 0 */
  timeout: HovercardStoreState["timeout"];
  /** @default 500 */
  showTimeout: HovercardStoreState["showTimeout"];
  /** @default 0 */
  hideTimeout: HovercardStoreState["hideTimeout"];
}

export type TooltipStoreFunctions = HovercardStoreFunctions;

export interface TooltipStoreOptions
  extends StoreOptions<
      TooltipStoreState,
      | "type"
      | "placement"
      | "timeout"
      | "showTimeout"
      | "hideTimeout"
      | "skipTimeout"
    >,
    HovercardStoreOptions {}

export type TooltipStoreProps = TooltipStoreOptions &
  StoreProps<TooltipStoreState>;

export type TooltipStore = TooltipStoreFunctions & Store<TooltipStoreState>;
