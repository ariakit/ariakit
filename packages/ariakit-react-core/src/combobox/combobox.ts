import type {
  ChangeEvent,
  CompositionEvent,
  MouseEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPopupRole } from "@ariakit/core/utils/dom";
import {
  isFocusEventOutside,
  queueBeforeEvent,
} from "@ariakit/core/utils/events";
import { normalizeString } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import type { PopoverAnchorOptions } from "../popover/popover-anchor.js";
import { usePopoverAnchor } from "../popover/popover-anchor.js";
import {
  useBooleanEvent,
  useEvent,
  useForceUpdate,
  useForkRef,
  useId,
  useSafeLayoutEffect,
  useUpdateEffect,
  useUpdateLayoutEffect,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { ComboboxStore, ComboboxStoreState } from "./combobox-store.js";

function isFirstItemAutoSelected(
  items: ComboboxStoreState["items"],
  activeValue: ComboboxStoreState["activeValue"],
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
 * Returns props to create a `Combobox` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useCombobox({ store });
 * <Role {...props} />
 * <ComboboxPopover store={store}>
 *   <ComboboxItem value="Apple" />
 *   <ComboboxItem value="Banana" />
 *   <ComboboxItem value="Orange" />
 * </ComboboxPopover>
 * ```
 */
export const useCombobox = createHook<ComboboxOptions>(
  ({
    store,
    focusable = true,
    autoSelect: autoSelectProp = false,
    showOnChange = true,
    setValueOnChange = true,
    showOnMouseDown = true,
    setValueOnClick = true,
    showOnKeyDown = true,
    moveOnKeyPress = true,
    autoComplete = "list",
    ...props
  }) => {
    const ref = useRef<HTMLInputElement>(null);
    const [valueUpdated, forceValueUpdate] = useForceUpdate();
    const valueChangedRef = useRef(false);
    const composingRef = useRef(false);

    // We can only allow auto select when the combobox focus is handled via the
    // aria-activedescendant attribute. Othwerwise, the focus would move to the
    // first item on every keypress.
    const autoSelect = store.useState(
      (state) => !!autoSelectProp && state.virtualFocus
    );

    const inline = autoComplete === "inline" || autoComplete === "both";
    // The inline autocomplete should only happen in certain circumstances. We
    // control this state here.
    const [canInline, setCanInline] = useState(inline);

    // If the inline autocomplete is enabled in a update, we need to update the
    // canInline state to reflect this. TODO: Try derived state.
    useUpdateLayoutEffect(() => {
      if (!inline) return;
      setCanInline(true);
    }, [inline]);

    const storeValue = store.useState("value");
    const activeValue = store.useState((state) =>
      inline && canInline ? state.activeValue : undefined
    );
    const items = store.useState("renderedItems");
    const open = store.useState("open");

    // The current input value may differ from state.value when
    // autoComplete is either "both" or "inline", in which case it will be
    // the active item value or a combination of the input value and the active
    // item value if it's the first item and it's been auto selected. This will
    // only affect the element's value, not the combobox state.
    const value = useMemo(() => {
      if (!inline) return storeValue;
      if (!canInline) return storeValue;
      const firstItemAutoSelected = isFirstItemAutoSelected(
        items,
        activeValue,
        autoSelect
      );
      if (firstItemAutoSelected) {
        // If the first item is auto selected, we should append the completion
        // string to the end of the value. This will be highlited in the effect
        // below.
        if (hasCompletionString(storeValue, activeValue)) {
          const slice = activeValue?.slice(storeValue.length) || "";
          return storeValue + slice;
        }
        return storeValue;
      }
      return activeValue || storeValue;
    }, [inline, canInline, items, activeValue, autoSelect, storeValue]);

    // Listen to the combobox-item-move event that's dispacthed the ComboboxItem
    // component so we can enable the inline autocomplete when the user moves
    // the focus to an item using the keyboard.
    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      const onCompositeItemMove = () => setCanInline(true);
      element.addEventListener("combobox-item-move", onCompositeItemMove);
      return () => {
        element.removeEventListener("combobox-item-move", onCompositeItemMove);
      };
    }, []);

    // Highlights the completion string
    useEffect(() => {
      if (!inline) return;
      if (!canInline) return;
      if (!activeValue) return;
      const firstItemAutoSelected = isFirstItemAutoSelected(
        items,
        activeValue,
        autoSelect
      );
      if (!firstItemAutoSelected) return;
      if (!hasCompletionString(storeValue, activeValue)) return;
      const element = ref.current;
      if (!element) return;
      // TODO: Comment
      queueMicrotask(() => {
        element.setSelectionRange(storeValue.length, activeValue.length);
      });
    }, [
      valueUpdated,
      inline,
      canInline,
      activeValue,
      items,
      autoSelect,
      storeValue,
    ]);

    // Set the changed flag to true whenever the combobox value changes and is
    // not empty. We're doing this here in addition to in the onChange handler
    // because the value may change programmatically.
    useSafeLayoutEffect(() => {
      if (!storeValue) return;
      if (composingRef.current) return;
      valueChangedRef.current = true;
    }, [storeValue]);

    // Reset the changed flag when the popover is not open so we don't try to
    // auto select an item after the popover closes (for example, in the middle
    // of an animation).
    useSafeLayoutEffect(() => {
      if (open) return;
      valueChangedRef.current = false;
    }, [open]);

    // Auto select the first item on type. This effect runs both when the value
    // changes and when the items change so we also catch async items.
    useUpdateEffect(() => {
      if (!autoSelect) return;
      if (!valueChangedRef.current) return;
      // If there's no first item (that is, there no items or all items are
      // disabled), we should move the focus to the input (null), otherwise,
      // with async items, the activeValue won't be reset.
      store.move(store.first() ?? null);
    }, [store, valueUpdated, storeValue, autoSelect, items]);

    // Focus on the combobox input on type.
    useSafeLayoutEffect(() => {
      if (autoSelect) return;
      store.setActiveId(null);
    }, [valueUpdated, autoSelect, store]);

    const contentElement = store.useState("contentElement");

    // If it has inline auto completion, set the store value when the combobox
    // input or the combobox list lose focus.
    useEffect(() => {
      if (!inline) return;
      const combobox = ref.current;
      if (!combobox) return;
      const elements = [combobox, contentElement].filter(Boolean);
      const onBlur = (event: FocusEvent) => {
        if (elements.every((el) => isFocusEventOutside(event, el))) {
          store.setValue(value);
        }
      };
      elements.forEach((el) => el?.addEventListener("focusout", onBlur));
      return () => {
        elements.forEach((el) => el?.removeEventListener("focusout", onBlur));
      };
    }, [inline, contentElement, store, value]);

    const onChangeProp = props.onChange;
    const showOnChangeProp = useBooleanEvent(showOnChange);
    const setValueOnChangeProp = useBooleanEvent(setValueOnChange);

    const onChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      const { target } = event;
      const nativeEvent = event.nativeEvent;
      valueChangedRef.current = true;
      if (isInputEvent(nativeEvent) && inline) {
        if (nativeEvent.isComposing) {
          valueChangedRef.current = false;
          composingRef.current = true;
        }
        const textInserted =
          nativeEvent.inputType === "insertText" ||
          nativeEvent.inputType === "insertCompositionText";
        const caretAtEnd = target.selectionStart === target.value.length;
        setCanInline(textInserted && caretAtEnd);
      }
      if (showOnChangeProp(event)) {
        store.show();
      }
      if (setValueOnChangeProp(event)) {
        store.setValue(target.value);
      }
      if (inline && autoSelect) {
        // The store.setValue(event.target.value) above may not trigger a state
        // update. For example, say the first item starts with "t". The user
        // starts typing "t", then the first item is auto selected and the
        // inline completion string is appended and highlited. The user then
        // selects all the text and type "t" again. This change will produce the
        // same value as the store value, and therefore the state update will
        // not trigger a re-render. We need to force a re-render here so the
        // inline completion effect will be fired.
        forceValueUpdate();
      }
      if (!autoSelect || !valueChangedRef.current) {
        // If autoSelect is not set or it's not an insertion of text, focus on
        // the combobox input after changing the value.
        store.setActiveId(null);
      }
    });

    const onCompositionEndProp = props.onCompositionEnd;

    // When dealing with composition text (for example, when the user is typing
    // in accents or chinese characters), we need to set valueChangedRef to true
    // when the composition ends. This is because the native input event that's
    // passed to the change event above will not produce a consistent inputType
    // value across browsers, so we can't rely on that there.
    const onCompositionEnd = useEvent(
      (event: CompositionEvent<HTMLInputElement>) => {
        onCompositionEndProp?.(event);
        if (event.defaultPrevented) return;
        valueChangedRef.current = true;
        composingRef.current = false;
        if (!autoSelect) return;
        forceValueUpdate();
      }
    );

    const onMouseDownProp = props.onMouseDown;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const showOnMouseDownProp = useBooleanEvent(showOnMouseDown);

    const onMouseDown = useEvent((event: MouseEvent<HTMLInputElement>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.button) return;
      if (event.ctrlKey) return;
      store.setActiveId(null);
      if (setValueOnClickProp(event)) {
        store.setValue(value);
      }
      if (showOnMouseDownProp(event)) {
        queueBeforeEvent(event.currentTarget, "mouseup", store.show);
      }
    });

    const onKeyDownProp = props.onKeyDown;
    const showOnKeyDownProp = useBooleanEvent(showOnKeyDown);

    const onKeyDown = useEvent(
      (event: ReactKeyboardEvent<HTMLInputElement>) => {
        onKeyDownProp?.(event);
        if (event.defaultPrevented) return;
        valueChangedRef.current = false;
        if (event.ctrlKey) return;
        if (event.altKey) return;
        if (event.shiftKey) return;
        if (event.metaKey) return;
        const { open, activeId } = store.getState();
        if (open) return;
        if (activeId !== null) return;
        // Up and Down arrow keys should open the combobox popover.
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          if (showOnKeyDownProp(event)) {
            event.preventDefault();
            store.show();
          }
        }
      }
    );

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: ReactFocusEvent<HTMLInputElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      // TODO: See if it's necessary and refactor this valueChanged logic.
      // valueChangedRef.current = false;
    });

    // This is necessary so other components like ComboboxCancel can reference
    // the combobox input in their aria-controls attribute.
    const id = useId(props.id);

    props = {
      id,
      role: "combobox",
      "aria-autocomplete": autoComplete,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "aria-expanded": open,
      "aria-controls": contentElement?.id,
      value,
      ...props,
      ref: useForkRef(ref, props.ref),
      onChange,
      onCompositionEnd,
      onMouseDown,
      onKeyDown,
      onBlur,
    };

    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);

    props = useComposite({
      store,
      focusable,
      ...props,
      // Enable inline autocomplete when the user moves from the combobox input
      // to an item.
      moveOnKeyPress: (event) => {
        if (!moveOnKeyPressProp(event)) return false;
        if (inline) setCanInline(true);
        return true;
      },
    });

    props = usePopoverAnchor({ store, ...props });

    return { autoComplete: "off", ...props };
  }
);

/**
 * Renders a combobox input.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxItem value="Apple" />
 *   <ComboboxItem value="Banana" />
 *   <ComboboxItem value="Orange" />
 * </ComboboxPopover>
 * ```
 */
export const Combobox = createComponent<ComboboxOptions>((props) => {
  const htmlProps = useCombobox(props);
  return createElement("input", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Combobox.displayName = "Combobox";
}

export interface ComboboxOptions<T extends As = "input">
  extends CompositeOptions<T>,
    PopoverAnchorOptions<T> {
  /**
   * Object returned by the `useComboboxStore` hook.
   */
  store: ComboboxStore;
  /**
   * Whether the first item will be automatically selected when the combobox
   * input value changes. When it's set to `true`, the exact behavior will
   * depend on the value of `autoComplete` prop:
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
   * Whether the items will be filtered based on `value` and whether the input
   * value will temporarily change based on the active item. If `defaultList`
   * or `list` are provided, this will be set to `list` by default, otherwise
   * it'll default to `none`.
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
   * Whether the combobox list/popover should be shown when the input value is
   * changed.
   * @default true
   * @example
   * ```jsx
   * <Combobox showOnChange={(event) => event.target.value.length > 1} />
   * ```
   */
  showOnChange?: BooleanOrCallback<ChangeEvent<HTMLElement>>;
  /**
   * Whether the combobox store value will be updated when the input value
   * changes. This is useful if you want to customize how the store value is
   * updated based on the input value.
   * @default true
   */
  setValueOnChange?: BooleanOrCallback<ChangeEvent<HTMLElement>>;
  /**
   * Whether the combobox list/popover should be shown when the input is
   * clicked.
   * @default true
   * @example
   * ```jsx
   * const combobox = useComboboxStore();
   * const canShow = combobox.useState((state) => state.value.length > 1);
   * <Combobox store={combobox} showOnMouseDown={canShow} />
   * ```
   */
  showOnMouseDown?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether the combobox list/popover should be shown when the user presses
   * the arrow up or down keys while focusing on the combobox input element.
   * @default true
   * @example
   * ```jsx
   * const combobox = useComboboxStore();
   * const canShow = combobox.useState((state) => state.value.length > 1);
   * <Combobox store={combobox} showOnKeyDown={canShow} />
   * ```
   */
  showOnKeyDown?: BooleanOrCallback<ReactKeyboardEvent<HTMLElement>>;
  /**
   * Whether the combobox store value will be updated when the combobox input
   * element gets clicked. This usually only applies when `autoComplete` is
   * `both` or `inline`, because the input value will temporarily change based
   * on the active item and the store value will not be updated until the user
   * confirms the selection.
   * @default true
   */
  setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}

export type ComboboxProps<T extends As = "input"> = Props<ComboboxOptions<T>>;
