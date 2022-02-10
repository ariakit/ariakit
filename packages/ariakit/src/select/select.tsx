import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BasePlacement } from "@popperjs/core";
import { queueBeforeEvent } from "ariakit-utils/events";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
  useRefId,
  useWrapElement,
} from "ariakit-utils/hooks";
import { useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import {
  CompositeTypeaheadOptions,
  useCompositeTypeahead,
} from "../composite/composite-typeahead";
import {
  PopoverDisclosureOptions,
  usePopoverDisclosure,
} from "../popover/popover-disclosure";
import { VisuallyHidden } from "../visually-hidden";
import { Item, SelectContext, findFirstEnabledItemWithValue } from "./__utils";
import { SelectArrow } from "./select-arrow";
import { SelectState } from "./select-state";

function getSelectedValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

// When moving through the items when the select list is closed, we don't want
// to move to items without value, so we filter them out here.
function nextWithValue(items: Item[], next: SelectState["next"]) {
  return () => {
    const nextId = next();
    if (!nextId) return;
    let i = 0;
    let nextItem = items.find((item) => item.id === nextId);
    const firstItem = nextItem;
    while (nextItem && nextItem.value == null) {
      const nextId = next(++i);
      if (!nextId) return;
      nextItem = items.find((item) => item.id === nextId);
      // Prevents infinite loop when focusLoop is true
      if (nextItem === firstItem) break;
    }
    return nextItem?.id;
  };
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select button.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelect({ state });
 * <Role {...props} />
 * ```
 */
export const useSelect = createHook<SelectOptions>(
  ({
    state,
    name,
    showOnKeyDown = true,
    moveOnKeyDown = true,
    toggleOnClick = false,
    toggleOnPress = !toggleOnClick,
    ...props
  }) => {
    toggleOnPress = toggleOnClick ? false : toggleOnPress;

    const onKeyDownProp = useEventCallback(props.onKeyDown);
    const showOnKeyDownProp = useBooleanEventCallback(showOnKeyDown);
    const moveOnKeyDownProp = useBooleanEventCallback(moveOnKeyDown);
    const toggleOnPressProp = useBooleanEventCallback(toggleOnPress);
    const dir = state.placement.split("-")[0] as BasePlacement;
    const multiSelectable = Array.isArray(state.value);

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        // toggleOnPress
        if (event.key === " " || event.key === "Enter") {
          if (toggleOnPressProp(event)) {
            state.toggle();
          }
        }
        // moveOnKeyDown
        const isVertical = state.orientation !== "horizontal";
        const isHorizontal = state.orientation !== "vertical";
        const isGrid = !!findFirstEnabledItemWithValue(state.items)?.rowId;
        const moveKeyMap = {
          ArrowUp:
            (isGrid || isVertical) && nextWithValue(state.items, state.up),
          ArrowRight:
            (isGrid || isHorizontal) && nextWithValue(state.items, state.next),
          ArrowDown:
            (isGrid || isVertical) && nextWithValue(state.items, state.down),
          ArrowLeft:
            (isGrid || isHorizontal) &&
            nextWithValue(state.items, state.previous),
        };
        const getId = moveKeyMap[event.key as keyof typeof moveKeyMap];
        if (getId && moveOnKeyDownProp(event)) {
          event.preventDefault();
          state.move(getId());
        }
        // showOnKeyDown
        const isTopOrBottom = dir === "top" || dir === "bottom";
        const isLeft = dir === "left";
        const isRight = dir === "right";
        const canShowKeyMap = {
          ArrowDown: isTopOrBottom,
          ArrowUp: isTopOrBottom,
          ArrowLeft: isLeft,
          ArrowRight: isRight,
        };
        const canShow = canShowKeyMap[event.key as keyof typeof canShowKeyMap];
        if (canShow && showOnKeyDownProp(event)) {
          event.preventDefault();
          state.show();
          state.move(state.activeId);
        }
      },
      [
        onKeyDownProp,
        toggleOnPressProp,
        state.toggle,
        state.orientation,
        state.items,
        state.up,
        state.next,
        state.down,
        state.previous,
        moveOnKeyDownProp,
        state.move,
        dir,
        showOnKeyDownProp,
        state.show,
        state.activeId,
      ]
    );

    const onMouseDownProp = useEventCallback(props.onMouseDown);

    const onMouseDown = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onMouseDownProp(event);
        if (event.defaultPrevented) return;
        if (!toggleOnPressProp(event)) return;
        const element = event.currentTarget;
        queueBeforeEvent(element, "focusin", () => {
          state.disclosureRef.current = event.currentTarget;
          state.toggle();
        });
      },
      [onMouseDownProp, toggleOnPressProp, state.toggle]
    );

    props = useStoreProvider({ state, ...props }, SelectContext);

    const [autofill, setAutofill] = useState(false);
    const nativeSelectChangedRef = useRef(false);

    // Resets the autofilled state when the select value changes, but only if
    // the change wasn't triggered by the native select element (which is an
    // autofill).
    useEffect(() => {
      const nativeSelectChanged = nativeSelectChangedRef.current;
      nativeSelectChangedRef.current = false;
      if (nativeSelectChanged) return;
      setAutofill(false);
    }, [state.value]);

    const labelId = useRefId(state.labelRef);
    const itemsWithValue = useMemo(
      () => state.items.filter((item) => item.value != null),
      [state.items]
    );

    // Renders a native select element with the same value as the select so we
    // support browser autofill. When the native select value changes, the
    // onChange event is triggered and we set the autofill state to true.
    props = useWrapElement(
      props,
      (element) => (
        <>
          <VisuallyHidden
            as="select"
            tabIndex={-1}
            aria-hidden
            // TODO: Add props[aria-label] and props[aria-labelledby]
            aria-labelledby={labelId}
            name={name}
            value={state.value}
            multiple={multiSelectable}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              nativeSelectChangedRef.current = true;
              setAutofill(true);
              state.setValue(
                multiSelectable
                  ? getSelectedValues(event.target)
                  : event.target.value
              );
            }}
          >
            {itemsWithValue.map((item) => (
              <option key={item.id} value={item.value}>
                {item.value}
              </option>
            ))}
          </VisuallyHidden>
          {element}
        </>
      ),
      [
        labelId,
        name,
        state.value,
        multiSelectable,
        state.setValue,
        itemsWithValue,
      ]
    );

    const children = (
      <>
        {state.value}
        <SelectArrow />
      </>
    );

    props = {
      role: "combobox",
      "aria-autocomplete": "none",
      "aria-labelledby": labelId,
      "data-autofill": autofill ? "" : undefined,
      children,
      ...props,
      ref: useForkRef(state.selectRef, props.ref),
      onKeyDown,
      onMouseDown,
    };

    props = usePopoverDisclosure({ state, toggleOnClick, ...props });
    props = useCompositeTypeahead({ state, ...props });

    return props;
  }
);

/**
 * A component that renders a select button.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const Select = createComponent<SelectOptions>((props) => {
  const htmlProps = useSelect(props);
  return createElement("button", htmlProps);
});

export type SelectOptions<T extends As = "button"> = Omit<
  PopoverDisclosureOptions<T>,
  "state" | "toggleOnClick"
> &
  Omit<CompositeTypeaheadOptions<T>, "state"> & {
    /**
     * Object returned by the `useSelectState` hook.
     */
    state: SelectState;
    /**
     * Determines whether the select list will be shown when the user presses
     * arrow keys while the select element is focused.
     * @default true
     */
    showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
    /**
     * Determines whether pressing arrow keys will move the active item even
     * when the select list is hidden.
     * @default false
     */
    moveOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
    /**
     * Determines whether `state.toggle()` will be called on click. By default,
     * the select list will be shown on press (on mouse down and on key down).
     * If this prop is set to `true`, the select list will be shown on click
     * instead.
     * @default false
     */
    toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
    /**
     * Determines whether pressing space, enter or mouse down will toggle the
     * select list. This will be ignored if `toggleOnClick` is set to `true`.
     * @default true
     */
    toggleOnPress?: BooleanOrCallback<
      MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
    >;
  };

export type SelectProps<T extends As = "button"> = Props<SelectOptions<T>>;
