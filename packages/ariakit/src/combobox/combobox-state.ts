import { useEffect, useMemo, useState } from "react";
import {
  useControlledState,
  useDeferredValue,
  useLiveRef,
  useUpdateLayoutEffect,
} from "ariakit-utils/hooks";
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
  const [activeValue, setActiveValue] = useState<string | undefined>();
  const compositeRef = useLiveRef(composite);

  // Always reset the active value when the active item changes.
  useEffect(() => {
    setActiveValue(undefined);
  }, [composite.activeId]);

  // Update the active value when the active item changes by moving (which
  // usually happens when using the keyboard).
  useEffect(() => {
    const { items, activeId } = compositeRef.current;
    if (!activeId) return;
    const nextActiveValue = items.find(
      (item) => item.id === activeId && item.value
    )?.value;
    setActiveValue(nextActiveValue);
  }, [composite.moves]);

  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => getMatches({ limit, list, value: deferredValue }),
    [limit, list, deferredValue]
  );

  // Resets the combobox state when it gets hidden. This effect should be sync
  // (layout effect), otherwise pressing tab while focusing on a combobox item
  // will always put focus back on the combobox input. See
  // ../composite/composite.ts#132
  useUpdateLayoutEffect(() => {
    if (popover.visible) return;
    // We need to reset the composite state when the popover is closed.
    composite.setActiveId(defaultActiveId);
    composite.setMoves(0);
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
     * Sets the `value` state.
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
     * Sets the `list` state.
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
  };

export type ComboboxStateProps = CompositeStateProps<Item> &
  PopoverStateProps &
  Partial<Pick<ComboboxState, "value" | "list" | "limit">> & {
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
    /**
     * Function that will be called when setting the combobox `value` state.
     * @example
     * // Uncontrolled example
     * useComboboxState({ setValue: (value) => console.log(value) });
     * @example
     * // Controlled example
     * const [value, setValue] = useState("");
     * useComboboxState({ value, setValue });
     * @example
     * // Externally controlled example
     * function MyCombobox({ value, onChange }) {
     *   const combobox = useComboboxState({ value, setValue: onChange });
     * }
     */
    setValue?: (value: ComboboxState["value"]) => void;
    /**
     * Function that will be called when setting the combobox `list` state.
     * @example
     * const [list, setList] = useState([]);
     * useComboboxState({ list, setList });
     */
    setList?: (list: ComboboxState["list"]) => void;
  };
