import { RefObject, useEffect, useMemo, useRef } from "react";
import {
  useControlledState,
  useInitialValue,
  useLiveRef,
} from "ariakit-react-utils/hooks";
import { useStorePublisher } from "ariakit-react-utils/store";
import { toArray } from "ariakit-utils/array";
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
import {
  Item,
  findEnabledItemByValue,
  findEnabledItemWithValueById,
  findFirstEnabledItemWithValue,
} from "./__utils";

type Value = string | string[];
type MutableValue<T extends Value = Value> = T extends string ? string : T;

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
export function useSelectState<T extends Value = Value>({
  virtualFocus = true,
  orientation = "vertical",
  placement = "bottom-start",
  setValueOnMove = false,
  defaultActiveId = null,
  includesBaseElement = false,
  ...props
}: SelectStateProps<T> = {}): SelectState<T> {
  const selectRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLElement>(null);
  const [value, setValue] = useControlledState(
    props.defaultValue ?? ("" as any),
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
  const popover = usePopoverState({ ...props, placement });
  const initialValue = useInitialValue(props.value ?? props.defaultValue);
  const compositeRef = useLiveRef(composite);

  const multiSelectable = Array.isArray(value);

  // Automatically sets the default value if it's not set.
  useEffect(() => {
    if (multiSelectable) return;
    if (initialValue != null) return;
    if (!composite.items.length) return;
    const item = findFirstEnabledItemWithValue(composite.items);
    if (!item?.value) return;
    setValue((prevValue) => {
      if (prevValue || !item.value) return prevValue;
      return item.value as MutableValue<T>;
    });
  }, [multiSelectable, initialValue, composite.items, setValue]);

  // Sets the active id when the value changes and the popover is hidden.
  useEffect(() => {
    if (popover.mounted) return;
    const values = toArray(value);
    const lastValue = values[values.length - 1];
    if (!lastValue) return;
    const item = findEnabledItemByValue(composite.items, lastValue);
    if (!item) return;
    composite.setActiveId(item.id);
  }, [popover.mounted, composite.items, value, composite.setActiveId]);

  const mountedRef = useLiveRef(popover.mounted);

  // Sets the select value when the active item changes by moving (which usually
  // happens when moving to an item using the keyboard).
  useEffect(() => {
    if (multiSelectable) return;
    if (!setValueOnMove && mountedRef.current) return;
    const { activeId, items } = compositeRef.current;
    if (!composite.moves) return;
    if (!activeId) return;
    const item = findEnabledItemWithValueById(items, activeId);
    if (item?.value == null) return;
    setValue(item.value as MutableValue<T>);
  }, [multiSelectable, setValueOnMove, composite.moves, setValue]);

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

export type SelectState<T extends Value = Value> = CompositeState<Item> &
  PopoverState & {
    /**
     * The select value.
     */
    value: MutableValue<T>;
    /**
     * Sets the `value` state.
     * @example
     * const select = useSelectState();
     * select.setValue("new value");
     */
    setValue: SetState<SelectState<T>["value"]>;
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

export type SelectStateProps<T extends Value = Value> =
  CompositeStateProps<Item> &
    PopoverStateProps &
    Partial<Pick<SelectState<T>, "value" | "setValueOnMove">> & {
      /**
       * Default value of the select.
       */
      defaultValue?: T;
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
      setValue?: (value: SelectState<T>["value"]) => void;
    };
