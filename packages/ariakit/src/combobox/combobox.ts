import {
  ChangeEvent,
  CompositionEvent,
  MouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { getPopupRole } from "ariakit-utils/dom";
import { isFocusEventOutside } from "ariakit-utils/events";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForceUpdate,
  useForkRef,
  useId,
  useUpdateEffect,
} from "ariakit-utils/hooks";
import { normalizeString } from "ariakit-utils/misc";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import { CompositeOptions, useComposite } from "../composite/composite";
import {
  PopoverAnchorOptions,
  usePopoverAnchor,
} from "../popover/popover-anchor";
import { ComboboxState } from "./combobox-state";

function isFirstItemAutoSelected(
  items: ComboboxState["items"],
  activeValue: ComboboxState["activeValue"],
  autoSelect: ComboboxProps["autoSelect"]
) {
  if (!autoSelect) return false;
  const firstItem = items.find((item) => !item.disabled && item.value);
  return firstItem?.value === activeValue;
}

function hasCompletionString(value?: string, activeValue?: string) {
  if (!activeValue) return false;
  if (value == null) return false;
  value = normalizeString(value);
  return (
    activeValue.length > value.length &&
    activeValue.toLowerCase().indexOf(value.toLowerCase()) === 0
  );
}

function isInputEvent(event: Event): event is InputEvent {
  return event.type === "input";
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox input.
 * @see https://ariakit.org/docs/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useCombobox({ state });
 * <Role {...props} />
 * <ComboboxPopover state={state}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const useCombobox = createHook<ComboboxOptions>(
  ({
    state,
    focusable = true,
    autoSelect = false,
    showOnChange = true,
    showOnClick = true,
    showOnKeyDown = true,
    autoComplete = state.list.length ? "list" : "none",
    ...props
  }) => {
    const ref = useRef<HTMLInputElement>(null);
    const id = useId(props.id);
    const [valueUpdated, forceValueUpdate] = useForceUpdate();
    const hasInsertedTextRef = useRef(false);

    // We can only allow auto select when the combobox focus is handled via the
    // aria-activedescendant attribute. Othwerwise, the focus would move to the
    // first item on every keypress.
    autoSelect = !!autoSelect && state.virtualFocus;

    const inline = autoComplete === "inline" || autoComplete === "both";

    // The current input value may differ from state.value when
    // autoComplete is either "both" or "inline", in which case it will be
    // the active item value or a combination of the input value and the active
    // item value if it's the first item and it's been auto selected. This will
    // only affect the element's value, not the combobox state.
    const value = useMemo(() => {
      if (!inline) {
        return state.value;
      }
      const firstItemAutoSelected = isFirstItemAutoSelected(
        state.items,
        state.activeValue,
        autoSelect
      );
      if (firstItemAutoSelected) {
        // If the first item is auto selected, we should append the completion
        // string to the end of the value. This will be highlited in the effect
        // below.
        if (hasCompletionString(state.value, state.activeValue)) {
          const slice = state.activeValue?.slice(state.value.length) || "";
          return state.value + slice;
        }
        return state.value;
      }
      return state.activeValue || state.value;
    }, [inline, state.value, state.items, autoSelect, state.activeValue]);

    // Highlights the completion string
    useEffect(() => {
      if (!inline) return;
      if (!state.activeValue) return;
      const firstItemAutoSelected = isFirstItemAutoSelected(
        state.items,
        state.activeValue,
        autoSelect
      );
      if (!firstItemAutoSelected) return;
      if (!hasCompletionString(state.value, state.activeValue)) return;
      const element = ref.current;
      if (!element) return;
      element.setSelectionRange(state.value.length, state.activeValue.length);
    }, [
      valueUpdated,
      inline,
      state.activeValue,
      state.items,
      autoSelect,
      state.value,
    ]);

    // Auto select the first item on type.
    useUpdateEffect(() => {
      if (!autoSelect) return;
      if (!state.items.length) return;
      if (!hasInsertedTextRef.current) return;
      // If autoSelect is set to true and the last change was a text
      // insertion, we want to automatically focus on the first suggestion.
      // This effect will run both when value changes and when items change so
      // we can also catch async items.
      state.move(state.first());
    }, [
      valueUpdated,
      state.value,
      autoSelect,
      state.items,
      state.move,
      state.first,
    ]);

    // Focus on the combobox input on type.
    useUpdateEffect(() => {
      if (autoSelect) return;
      state.setActiveId(null);
    }, [valueUpdated, autoSelect, state.setActiveId]);

    // If it has inline auto completion, set the state value when the combobox
    // input or the combobox list lose focus.
    useEffect(() => {
      if (!inline) return;
      const combobox = ref.current;
      if (!combobox) return;
      const elements = [combobox, state.contentElement].filter(Boolean);
      const onBlur = (event: FocusEvent) => {
        if (elements.every((el) => isFocusEventOutside(event, el))) {
          state.setValue(value);
        }
      };
      elements.forEach((el) => el?.addEventListener("focusout", onBlur));
      return () => {
        elements.forEach((el) => el?.removeEventListener("focusout", onBlur));
      };
    }, [inline, state.contentElement, state.setValue, value]);

    const onChangeProp = useEventCallback(props.onChange);
    const showOnChangeProp = useBooleanEventCallback(showOnChange);

    const onChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        onChangeProp(event);
        if (event.defaultPrevented) return;
        const nativeEvent = event.nativeEvent;
        if (isInputEvent(nativeEvent)) {
          hasInsertedTextRef.current = nativeEvent.inputType === "insertText";
        }
        if (showOnChangeProp(event)) {
          state.show();
        }
        state.setValue(event.target.value);
        if (inline && autoSelect) {
          // The state.setValue(event.target.value) above may not trigger a
          // state update. For example, say the first item starts with "t". The
          // user starts typing "t", then the first item is auto selected and
          // the inline completion string is appended and highlited. The user
          // then selects all the text and type "t" again. This change will
          // produce the same value as the state value, and therefore the state
          // update will not trigger a re-render. We need to force a re-render
          // here so the inline completion effect will be fired.
          forceValueUpdate();
        }
        if (!autoSelect || !hasInsertedTextRef.current) {
          // If autoSelect is not set or it's not an insertion of text, focus on
          // the combobox input after changing the value.
          state.setActiveId(null);
        }
      },
      [
        onChangeProp,
        state.setValue,
        showOnChangeProp,
        state.show,
        inline,
        autoSelect,
        state.setActiveId,
      ]
    );

    const onCompositionEndProp = useEventCallback(props.onCompositionEnd);

    // When dealing with composition text (for example, when the user is typing
    // in accents or chinese characters), we need to set hasInsertedTextRef to
    // true when the composition ends. This is because the native input event
    // that's passed to the change event above will not produce a consistent
    // inputType value across browsers, so we can't rely on that there.
    const onCompositionEnd = useCallback(
      (event: CompositionEvent<HTMLInputElement>) => {
        onCompositionEndProp(event);
        if (event.defaultPrevented) return;
        hasInsertedTextRef.current = true;
        if (!autoSelect) return;
        forceValueUpdate();
      },
      [onCompositionEndProp, autoSelect]
    );

    const onClickProp = useEventCallback(props.onClick);
    const showOnClickProp = useBooleanEventCallback(showOnClick);

    // When clicking on the combobox input, we should make sure the current
    // input value is set on the state and focus is set on the input only.
    const onClick = useCallback(
      (event: MouseEvent<HTMLInputElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        if (showOnClickProp(event)) {
          state.show();
        }
        state.setActiveId(null);
        state.setValue(value);
      },
      [
        onClickProp,
        showOnClickProp,
        state.show,
        state.setActiveId,
        state.setValue,
        value,
      ]
    );

    const onKeyDownCaptureProp = useEventCallback(props.onKeyDownCapture);

    const onKeyDownCapture = useCallback(
      (event: ReactKeyboardEvent<HTMLInputElement>) => {
        onKeyDownCaptureProp(event);
        if (event.defaultPrevented) return;
        if (event.key.length === 1) {
          // Printable characters shouldn't perform actions on the combobox
          // items, only on the combobox input.
          return event.stopPropagation();
        }
        const hasRows = state.items.some((item) => !!item.rowId);
        const focusingInputOnly = state.activeId === null;
        // Pressing Home or End keys on the combobox should only be allowed when
        // the widget has rows and the combobox input is not the only element
        // with focus. That is, the aria-activedescendant has no value.
        const allowHorizontalNavigationOnItems = hasRows && !focusingInputOnly;
        const isHomeOrEnd = event.key === "Home" || event.key === "End";
        // If there are no rows or the combobox input is the only focused
        // element, then we should stop the event propagation so no action is
        // performed on the combobox items, but only on the combobox input, like
        // moving the caret/selection.
        if (!allowHorizontalNavigationOnItems && isHomeOrEnd) {
          event.stopPropagation();
        }
      },
      [onKeyDownCaptureProp, state.items, state.activeId]
    );

    const onKeyDownProp = useEventCallback(props.onKeyDown);
    const showOnKeyDownProp = useBooleanEventCallback(showOnKeyDown);

    const onKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLInputElement>) => {
        onKeyDownProp(event);
        hasInsertedTextRef.current = false;
        if (event.defaultPrevented) return;
        state?.setMoveType("keyboard");
        if (event.ctrlKey) return;
        if (event.altKey) return;
        if (event.shiftKey) return;
        if (event.metaKey) return;
        if (state.visible) return;
        if (state.activeId !== null) return;
        // Up and Down arrow keys should open the combobox popover.
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          if (showOnKeyDownProp(event)) {
            event.preventDefault();
            state.show();
          }
        }
      },
      [
        onKeyDownProp,
        state?.setMoveType,
        state.move,
        state.activeId,
        state.visible,
        showOnKeyDownProp,
        state.show,
      ]
    );

    props = {
      id,
      role: "combobox",
      "aria-autocomplete": autoComplete,
      "aria-haspopup": getPopupRole(state.contentElement, "listbox"),
      "aria-expanded": state.visible,
      "aria-controls": state.contentElement?.id,
      value,
      ...props,
      ref: useForkRef(ref, props.ref),
      onChange,
      onCompositionEnd,
      onClick,
      onKeyDownCapture,
      onKeyDown,
    };

    props = useComposite({ state, focusable, ...props });
    props = usePopoverAnchor({ state, ...props });

    return { autoComplete: "off", ...props };
  }
);

/**
 * A component that renders a combobox input.
 * @see https://ariakit.org/docs/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxPopover state={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const Combobox = createComponent<ComboboxOptions>((props) => {
  const htmlProps = useCombobox(props);
  return createElement("input", htmlProps);
});

export type ComboboxOptions<T extends As = "input"> = Omit<
  CompositeOptions<T>,
  "state"
> &
  Omit<PopoverAnchorOptions<T>, "state"> & {
    /**
     * Object returned by the `useComboboxState` hook.
     */
    state: ComboboxState;
    /**
     * Determines whether the first item will be automatically selected when the
     * combobox input value changes. When it's set to `true`, the exact behavior
     * will depend on the value of `autoComplete` prop:
     *   - If `autoComplete` is `both` or `inline`, the first item is
     *     automatically focused when the popup opens, and the input value
     *     changes to reflect this. The inline completion string will be
     *     highlighted and will have a selected state.
     *   - If `autoComplete` is `list` or `none`, the first item is
     *     automatically focused when the popup opens, but the input value
     *     doesn't change.
     * @default false
     */
    autoSelect?: boolean;
    /**
     * Determines whether the items will be filtered based on `value` and
     * whether the input value will temporarily change based on the active item.
     * If `defaultList` or `list` are provided, this will be set to `list` by
     * default, otherwise it'll default to `none`.
     *   - `both`: the items will be filtered based on `value` and the input
     *     value will temporarily change based on the active item.
     *   - `list`: the items will be filtered based on `value` and the input
     *     value will NOT change based on the active item.
     *   - `inline`: the items are static, that is, they won't be filtered based
     *     on `value`, but the input value will temporarily change based on the
     *     active item.
     *   - `none`: the items are static and the input value will NOT change
     *     based on the active item.
     */
    autoComplete?: "both" | "inline" | "list" | "none";
    /**
     * Determines whether the combobox list/popover should be shown when the
     * input value is changed. This can be a boolean or a function that receives
     * a ChangeEvent and returns a boolean.
     * @default true
     * @example
     * ```jsx
     * <Combobox showOnChange={(event) => event.target.value.length > 1} />
     * ```
     */
    showOnChange?: BooleanOrCallback<ChangeEvent<HTMLInputElement>>;
    /**
     * Determines whether the combobox list/popover should be shown when the
     * input is clicked. This can be a boolean or a function that receives a
     * MouseEvent and returns a boolean.
     * @default true
     * @example
     * ```jsx
     * const combobox = useComboboxState();
     * <Combobox state={combobox} showOnClick={combobox.value.length > 1} />
     * ```
     */
    showOnClick?: BooleanOrCallback<MouseEvent<HTMLInputElement>>;
    /**
     * Determines whether the combobox list/popover should be shown when the
     * user presses the arrow up or down keys while focusing on the combobox
     * input element. This can be a boolean or a function that receives a
     * KeyboardEvent and returns a boolean.
     * @default true
     * @example
     * ```jsx
     * const combobox = useComboboxState();
     * <Combobox state={combobox} showOnKeyDown={combobox.value.length > 1} />
     * ```
     */
    showOnKeyDown?: BooleanOrCallback<ReactKeyboardEvent<HTMLInputElement>>;
  };

export type ComboboxProps<T extends As = "input"> = Props<ComboboxOptions<T>>;
