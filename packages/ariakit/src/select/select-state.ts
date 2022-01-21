import { RefObject, useEffect, useMemo, useRef } from "react";
import {
  useControlledState,
  useInitialValue,
  useLiveRef,
} from "ariakit-utils/hooks";
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
import { Item, findFirstEnabledItemWithValue } from "./__utils";

function findEnabledItemByValue(items: Item[], value: string) {
  return items.find((item) => item.value === value && !item.disabled);
}

function findEnabledItemById(items: Item[], id: string) {
  return items.find((item) => item.id === id && !item.disabled);
}

/**
 * Provides state for the `Select` components.
 * @example
 * ```jsx
 * const select = useSelectState({ defaultValue: "Apple" });
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export function useSelectState({
  virtualFocus = true,
  orientation = "vertical",
  placement = "bottom-start",
  setValueOnMove = false,
  ...props
}: SelectStateProps = {}): SelectState {
  const selectRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLElement>(null);
  const [value, setValue] = useControlledState(
    props.defaultValue ?? "",
    props.value,
    props.setValue
  );
  const composite = useCompositeState<Item>({
    ...props,
    virtualFocus,
    orientation,
  });
  const popover = usePopoverState({ ...props, placement });
  const initialValue = useInitialValue(props.value ?? props.defaultValue);
  const activeIdRef = useLiveRef(composite.activeId);

  // Automatically sets the default value if it's not set.
  useEffect(() => {
    if (initialValue != null) return;
    if (!composite.items.length) return;
    const item = findFirstEnabledItemWithValue(composite.items);
    if (!item?.value) return;
    setValue(item.value);
  }, [initialValue, composite.items, setValue]);

  // Sets the activeId based on the value. That is, if the value is updated, we
  // want to make sure the corresponding item will receive focus the next time
  // the popover is open.
  // useEffect(() => {
  //   // TODO: maybe we don't need to set the activeId here?
  //   if (value == null) return;
  //   if (popover.mounted) return;
  //   const item = findEnabledItemByValue(composite.items, value);
  //   if (!item) return;
  //   composite.setActiveId(item?.id);
  // }, [value, popover.mounted, composite.items, composite.setActiveId]);

  const mountedRef = useLiveRef(popover.mounted);

  // Sets the select value when the active item changes by moving (which usually
  // happens when moving to an item using the keyboard).
  useEffect(() => {
    if (!setValueOnMove && mountedRef.current) return;
    if (!composite.moves) return;
    if (!activeIdRef.current) return;
    const item = findEnabledItemById(composite.items, activeIdRef.current);
    if (item?.value == null) return;
    setValue(item.value);
  }, [setValueOnMove, composite.moves, composite.items, setValue]);

  const state = useMemo(
    () => ({
      ...composite,
      ...popover,
      value,
      setValue,
      setValueOnMove,
      selectRef,
      labelRef,
    }),
    [composite, popover, value, setValue, setValueOnMove]
  );

  return useStorePublisher(state);
}

export type SelectState = CompositeState<Item> &
  PopoverState & {
    /**
     * The select value.
     */
    value: string;
    /**
     * Sets the `value` state.
     * @example
     * const select = useSelectState();
     * select.setValue("new value");
     */
    setValue: SetState<SelectState["value"]>;
    /**
     * Whether the select value should be set when the active item changes by
     * moving (which usually happens when moving to an item using the keyboard).
     * @default false
     */
    setValueOnMove: boolean;
    /**
     * The select button element's ref.
     */
    selectRef: RefObject<HTMLElement>;
    /**
     * The select label element's ref.
     */
    labelRef: RefObject<HTMLElement>;
  };

export type SelectStateProps = CompositeStateProps<Item> &
  PopoverStateProps &
  Partial<Pick<SelectState, "value" | "setValueOnMove">> & {
    /**
     * Default value of the select.
     */
    defaultValue?: SelectState["value"];
    /**
     * Function that will be called when setting the select `value` state.
     * @example
     * // Uncontrolled example
     * useSelectState({ setValue: (value) => console.log(value) });
     * @example
     * // Controlled example
     * const [value, setValue] = useState("");
     * useSelectState({ value, setValue });
     * @example
     * // Externally controlled example
     * function MySelect({ value, onChange }) {
     *   const select = useSelectState({ value, setValue: onChange });
     * }
     */
    setValue?: (value: SelectState["value"]) => void;
  };
