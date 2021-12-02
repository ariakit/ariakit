import { useMemo, useState } from "react";
import { useControlledState, useUpdateLayoutEffect } from "ariakit-utils/hooks";
import { normalizeString } from "ariakit-utils/misc";
import { isSafari, isTouchDevice } from "ariakit-utils/platform";
import { useStorePublisher } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  CompositeState,
  CompositeStateProps,
  useCompositeState,
} from "../composite/composite-state";
import {
  PopoverState,
  PopoverStateProps,
  usePopoverState,
} from "../popover/popover-state";

const isSafariOnMobile = isSafari() && isTouchDevice();

type Item = CompositeState["items"][number] & {
  value?: string;
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMatches(props: Pick<ComboboxState, "limit" | "value" | "list">) {
  if (props.limit === 0) return [];
  const value = normalizeString(props.value);
  const size = props.limit === false ? undefined : props.limit;
  const regex = new RegExp(escapeRegExp(value), "i");
  const matches = new Set<string>();
  // Get first the values that start with the search value.
  for (const v of props.list) {
    if (size && matches.size >= size) break;
    if (normalizeString(v).search(regex) === 0) {
      matches.add(v);
    }
  }
  // Then get any value that matches the search value.
  for (const v of props.list) {
    if (size && matches.size >= size) break;
    if (regex.test(normalizeString(v))) {
      matches.add(v);
    }
  }
  return Array.from(matches);
}

function getActiveValue(props: Pick<ComboboxState, "activeId" | "items">) {
  if (props.activeId) {
    return props.items.find((item) => item.id === props.activeId && item.value)
      ?.value;
  }
  return;
}

/**
 * Provides state for the `Combobox` components.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxPopover state={combobox}>
 *   <ComboboxItem>Item 1</ComboboxItem>
 *   <ComboboxItem>Item 2</ComboboxItem>
 *   <ComboboxItem>Item 3</ComboboxItem>
 * </ComboboxPopover>
 * ```
 */
export function useComboboxState({
  limit = false,
  defaultActiveId = null,
  includesBaseElement = true,
  orientation = "vertical",
  focusLoop = true,
  focusWrap = true,
  placement = "bottom-start",
  virtualFocus = !isSafariOnMobile,
  ...props
}: ComboboxStateProps = {}): ComboboxState {
  const [value, setValue] = useControlledState(
    props.defaultValue ?? "",
    props.value,
    props.setValue
  );
  const [list, setList] = useControlledState(
    props.defaultList || [],
    props.list,
    props.setList
  );
  const composite = useCompositeState<Item>({
    ...props,
    defaultActiveId,
    orientation,
    focusLoop,
    focusWrap,
    virtualFocus,
    includesBaseElement,
  });
  const popover = usePopoverState({ ...props, placement });
  const nextActiveValue = getActiveValue(composite);
  const [activeValue, setActiveValue] = useState(nextActiveValue);
  const [moveType, setMoveType] = useState<"keyboard" | "mouse">("keyboard");

  // We don't want to update the active value state if the last move type wasn't
  // originated by a keyboard event. For example, if the active item is updated
  // duo to the user moving the mouse over an item, we don't want to update the
  // active value state.
  if (activeValue !== nextActiveValue && moveType === "keyboard") {
    setActiveValue(nextActiveValue);
  }

  const matches = useMemo(
    () => getMatches({ limit, value, list }),
    [limit, value, list]
  );

  // Resets the combobox state when it gets hidden. This effect should be sync
  // (layout effect), otherwise pressing tab while focusing on a combobox item
  // will always put focus back on the combobox input. See
  // ../composite/composite.ts#132
  useUpdateLayoutEffect(() => {
    if (!popover.visible) {
      setMoveType("keyboard");
      // We need to reset the composite state when the popover is closed.
      composite.setActiveId(defaultActiveId);
      composite.setMoves(0);
    }
  }, [popover.visible, composite.setActiveId, composite.setMoves]);

  const state = useMemo(
    () => ({
      ...composite,
      ...popover,
      value,
      setValue,
      activeValue,
      list,
      setList,
      limit,
      matches,
      moveType,
      setMoveType,
    }),
    [
      composite,
      popover,
      value,
      setValue,
      activeValue,
      list,
      setList,
      limit,
      matches,
      moveType,
      setMoveType,
    ]
  );

  return useStorePublisher(state);
}

export type ComboboxState = CompositeState<Item> &
  PopoverState & {
    /**
     * The input value.
     */
    value: string;
    /**
     * Sets `value`.
     * @example
     * const combobox = useComboboxState();
     * combobox.setValue("new value");
     */
    setValue: SetState<ComboboxState["value"]>;
    /**
     * The value of the current active item when `moveType` is `keyboard`. This
     * is not updated when `moveType` is `mouse`.
     */
    activeValue?: string;
    /**
     * The list of values that will be used to populate the `matches` state,
     * which can be used to render the combobox items.
     * @default []
     */
    list: string[];
    /**
     * Sets `list`.
     */
    setList: SetState<ComboboxState["list"]>;
    /**
     * Maximum number of `matches`. If it's set to `false`, there will be no
     * limit.
     * @default false
     */
    limit: number | false;
    /**
     * Result of filtering `list` based on `value`.
     * @default []
     * @example
     * const combobox = useComboboxState({ defaultList: ["Red", "Green"] });
     * combobox.matches; // ["Red", "Green"]
     * combobox.setValue("g");
     * // On next render
     * combobox.matches; // ["Green"]
     */
    matches: string[];
    /**
     * The type of the last item move.
     * @default "keyboard"
     */
    moveType: "keyboard" | "mouse";
    /**
     * Sets `moveType`.
     */
    setMoveType: SetState<ComboboxState["moveType"]>;
  };

export type ComboboxStateProps = CompositeStateProps<Item> &
  PopoverStateProps &
  Partial<
    Pick<ComboboxState, "value" | "setValue" | "list" | "setList" | "limit">
  > & {
    /**
     * Default value of the combobox input.
     */
    defaultValue?: ComboboxState["value"];
    /**
     * The list of values that will be used to populate the `matches` state,
     * which can be used to render the combobox items. See `list` for more
     * information.
     * @example
     * ```jsx
     * const combobox = useComboboxState({ defaultList: ["Red", "Green"] });
     * <Combobox state={combobox} />
     * <ComboboxPopover state={combobox}>
     *   {combobox.matches.map((value) => (
     *     <ComboboxItem key={value} value={value} />
     *   ))}
     * </ComboboxPopover>
     * ```
     */
    defaultList?: ComboboxState["list"];
  };
