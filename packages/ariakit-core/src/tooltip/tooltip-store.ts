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
  props: TooltipStoreProps = {},
): TooltipStore {
  if (process.env.NODE_ENV !== "production") {
    if (props.type === "label") {
      console.warn(
        "The `type` option on the tooltip store is deprecated.",
        "Render a visually hidden label or use the `aria-label` or `aria-labelledby` attributes on the anchor element instead.",
        "See https://ariakit.org/components/tooltip#tooltip-anchors-must-have-accessible-names",
      );
    }
  }

  const syncState = props.store?.getState();

  const hovercard = createHovercardStore({
    ...props,
    placement: defaultValue(
      props.placement,
      syncState?.placement,
      "top" as const,
    ),
    hideTimeout: defaultValue(props.hideTimeout, syncState?.hideTimeout, 0),
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
  /** @default "top" */
  placement: HovercardStoreState["placement"];
  /** @default 0 */
  hideTimeout?: HovercardStoreState["hideTimeout"];
  /**
   * Determines whether the tooltip is being used as a label or a description
   * for the anchor element.
   * @deprecated Render a visually hidden label or use the `aria-label` or
   * `aria-labelledby` attributes on the anchor element instead.
   * @default "description"
   */
  type: "label" | "description";
  /**
   * The amount of time after a tooltip is hidden while all tooltips on the
   * page can be shown immediately, without waiting for the show timeout.
   * @default 300
   */
  skipTimeout: number;
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

export interface TooltipStoreProps
  extends TooltipStoreOptions,
    StoreProps<TooltipStoreState> {}

export interface TooltipStore
  extends TooltipStoreFunctions,
    Store<TooltipStoreState> {}
