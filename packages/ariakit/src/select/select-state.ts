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

function findEnabledItemWithValueById(items: Item[], id: string) {
  return items.find(
    (item) => item.value != null && item.id === id && !item.disabled
  );
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
  defaultActiveId = null,
  includesBaseElement = false,
  fixed = true,
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
    defaultActiveId,
    includesBaseElement,
  });
  const popover = usePopoverState({ ...props, placement, fixed });
  const initialValue = useInitialValue(props.value ?? props.defaultValue);
  const compositeRef = useLiveRef(composite);

  // Automatically sets the default value if it's not set.
  useEffect(() => {
    if (initialValue != null) return;
    if (!composite.items.length) return;
    const item = findFirstEnabledItemWithValue(composite.items);
    if (!item?.value) return;
    setValue((prevValue) => {
      if (prevValue || !item.value) return prevValue;
      return item.value;
    });
  }, [initialValue, composite.items, setValue]);

  const mountedRef = useLiveRef(popover.mounted);

  // Sets the select value when the active item changes by moving (which usually
  // happens when moving to an item using the keyboard).
  useEffect(() => {
    if (!setValueOnMove && mountedRef.current) return;
    const { activeId, items } = compositeRef.current;
    if (!composite.moves) return;
    if (!activeId) return;
    const item = findEnabledItemWithValueById(items, activeId);
    if (item?.value == null) return;
    setValue(item.value);
  }, [setValueOnMove, composite.moves, setValue]);

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
