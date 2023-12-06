import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AriaAttributes,
  ChangeEvent,
  CompositionEvent,
  MouseEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  getPopupRole,
  getScrollingElement,
  setSelectionRange,
} from "@ariakit/core/utils/dom";
import {
  isFocusEventOutside,
  queueBeforeEvent,
} from "@ariakit/core/utils/events";
import { hasFocus } from "@ariakit/core/utils/focus";
import {
  invariant,
  isFalsyBooleanCallback,
  normalizeString,
} from "@ariakit/core/utils/misc";
import type {
  BooleanOrCallback,
  StringWithValue,
} from "@ariakit/core/utils/types";
import { flushSync } from "react-dom";
import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import type { PopoverAnchorOptions } from "../popover/popover-anchor.js";
import { usePopoverAnchor } from "../popover/popover-anchor.js";
import {
  useBooleanEvent,
  useEvent,
  useForceUpdate,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useUpdateEffect,
  useUpdateLayoutEffect,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useComboboxProviderContext } from "./combobox-context.js";
import type { ComboboxStore, ComboboxStoreState } from "./combobox-store.js";

function isFirstItemAutoSelected(
  items: ComboboxStoreState["items"],
  activeValue: ComboboxStoreState["activeValue"],
  autoSelect: ComboboxProps["autoSelect"],
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

function isAriaAutoCompleteValue(
  value: string,
): value is Required<AriaAttributes>["aria-autocomplete"] {
  return (
    value === "inline" ||
    value === "list" ||
    value === "both" ||
    value === "none"
  );
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
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Combobox must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const ref = useRef<HTMLInputElement>(null);
    const [valueUpdated, forceValueUpdate] = useForceUpdate();
    const canAutoSelectRef = useRef(false);
    const composingRef = useRef(false);

    // We can only allow auto select when the combobox focus is handled via the
    // aria-activedescendant attribute. Othwerwise, the focus would move to the
    // first item on every keypress.
    const autoSelect = store.useState(
      (state) => !!autoSelectProp && state.virtualFocus,
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
      inline && canInline ? state.activeValue : undefined,
    );
    const items = store.useState("renderedItems");
    const open = store.useState("open");
    const contentElement = store.useState("contentElement");

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
        autoSelect,
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
        autoSelect,
      );
      if (!firstItemAutoSelected) return;
      if (!hasCompletionString(storeValue, activeValue)) return;
      // For some reason, this setSelectionRange may run before the value is
      // updated in the DOM. We're using a microtask to make sure it runs after
      // the value is updated so we don't lose the selection. See combobox-group
      // test-browser file.
      queueMicrotask(() => {
        const element = ref.current;
        if (!element) return;
        setSelectionRange(element, storeValue.length, activeValue.length);
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

    const scrollingElementRef = useRef<Element | null>(null);

    // Disable the autoSelect behavior when the user scrolls the combobox
    // content. This prevents the focus from moving to the first item on
    // virtualized and infinite lists.
    useEffect(() => {
      if (!open) return;
      if (!contentElement) return;
      const scrollingElement = getScrollingElement(contentElement);
      if (!scrollingElement) return;
      scrollingElementRef.current = scrollingElement;
      const onWheel = () => {
        // A wheel event is always initiated by the user, so we can disable the
        // autoSelect behavior without any additional checks.
        canAutoSelectRef.current = false;
      };
      const onScroll = () => {
        if (!store) return;
        // We won't disable the autoSelect behavior if the first item is still
        // focused.
        const { activeId } = store.getState();
        if (activeId === null) return;
        if (activeId === store.first()) return;
        canAutoSelectRef.current = false;
      };
      const options = { passive: true, capture: true };
      scrollingElement.addEventListener("wheel", onWheel, options);
      scrollingElement.addEventListener("scroll", onScroll, options);
      return () => {
        scrollingElement.removeEventListener("wheel", onWheel, true);
        scrollingElement.removeEventListener("scroll", onScroll, true);
      };
    }, [open, contentElement, store]);

    // Set the changed flag to true whenever the combobox value changes and is
    // not empty. We're doing this here in addition to in the onChange handler
    // because the value may change programmatically.
    useSafeLayoutEffect(() => {
      if (!storeValue) return;
      if (composingRef.current) return;
      canAutoSelectRef.current = true;
    }, [storeValue]);

    // Reset the changed flag when the popover is not open so we don't try to
    // auto select an item after the popover closes (for example, in the middle
    // of an animation).
    useSafeLayoutEffect(() => {
      if (open) return;
      canAutoSelectRef.current = false;
    }, [open]);

    const resetValueOnSelect = store.useState("resetValueOnSelect");

    // Auto select the first item on type. This effect runs both when the value
    // changes and when the items change so we also catch async items.
    useUpdateEffect(() => {
      if (!store) return;
      if (!autoSelect && !resetValueOnSelect) return;
      if (!canAutoSelectRef.current) return;
      const { baseElement, contentElement, activeId } = store.getState();
      if (baseElement && !hasFocus(baseElement)) return;
      // The data-placing attribue is an internal state added by the Popover
      // component. We can observe it to know when the popover is done placing
      // itself. This is to prevent the focus from moving to the first item
      // while the popover is still calculating its position, which could cause
      // a srcoll jump. See combobox-group test-browser file.
      if (contentElement?.hasAttribute("data-placing")) {
        const observer = new MutationObserver(forceValueUpdate);
        observer.observe(contentElement, { attributeFilter: ["data-placing"] });
        return () => observer.disconnect();
      }
      // If there's no first item (that is, there no items or all items are
      // disabled), we should move the focus to the input (null), otherwise,
      // with async items, the activeValue won't be reset.
      if (autoSelect) {
        store.move(store.first() ?? null);
      } else {
        const element = store.item(activeId)?.element;
        if (element && "scrollIntoView" in element) {
          element.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }
      return;
    }, [
      store,
      valueUpdated,
      storeValue,
      autoSelect,
      resetValueOnSelect,
      items,
    ]);

    // If it has inline auto completion, set the store value when the combobox
    // input or the combobox list lose focus.
    useEffect(() => {
      if (!inline) return;
      const combobox = ref.current;
      if (!combobox) return;
      const elements = [combobox, contentElement].filter(
        (value): value is HTMLElement => !!value,
      );
      const onBlur = (event: FocusEvent) => {
        if (elements.every((el) => isFocusEventOutside(event, el))) {
          store?.setValue(value);
        }
      };
      elements.forEach((el) => el.addEventListener("focusout", onBlur));
      return () => {
        elements.forEach((el) => el.removeEventListener("focusout", onBlur));
      };
    }, [inline, contentElement, store, value]);

    const onChangeProp = props.onChange;
    const showOnChangeProp = useBooleanEvent(showOnChange);
    const setValueOnChangeProp = useBooleanEvent(setValueOnChange);

    const onChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      const { value, selectionStart, selectionEnd } = event.target;
      const nativeEvent = event.nativeEvent;
      canAutoSelectRef.current = true;
      if (isInputEvent(nativeEvent)) {
        if (nativeEvent.isComposing) {
          canAutoSelectRef.current = false;
          composingRef.current = true;
        }
        if (inline) {
          const textInserted =
            nativeEvent.inputType === "insertText" ||
            nativeEvent.inputType === "insertCompositionText";
          const caretAtEnd = selectionStart === value.length;
          setCanInline(textInserted && caretAtEnd);
        }
      }
      if (setValueOnChangeProp(event)) {
        const isSameValue = value === store.getState().value;
        flushSync(() => store?.setValue(value));
        // When the value is not set synchronously, the selection range may be
        // lost. Even setting the value with flushSync above, we still need to
        // fix the selection range because React's useSyncExternalStore updates
        // in a microtask. An alternative fix would be removing the flushSync
        // call above and calling setSelectionRange in a queueMicrotask
        // callback, but I think flushSync is a safer approach. See
        // combobox-group "keep caret position when typing" test.
        setSelectionRange(event.currentTarget, selectionStart, selectionEnd);
        if (inline && autoSelect && isSameValue) {
          // The store.setValue(event.target.value) above may not trigger a
          // state update. For example, say the first item starts with "t". The
          // user starts typing "t", then the first item is auto selected and
          // the inline completion string is appended and highlited. The user
          // then selects all the text and type "t" again. This change will
          // produce the same value as the store value, and therefore the state
          // update will not trigger a re-render. We need to force a re-render
          // here so the inline completion effect will be fired.
          forceValueUpdate();
        }
      }
      if (showOnChangeProp(event)) {
        store.show();
      }
      if (!autoSelect || !canAutoSelectRef.current) {
        // If autoSelect is not set or it's not an insertion of text, focus on
        // the combobox input after changing the value.
        store.setActiveId(null);
      }
    });

    const onCompositionEndProp = props.onCompositionEnd;

    // When dealing with composition text (for example, when the user is typing
    // in accents or chinese characters), we need to set canAutoSelectRef to
    // true when the composition ends. This is because the native input event
    // that's passed to the change event above will not produce a consistent
    // inputType value across browsers, so we can't rely on that there.
    const onCompositionEnd = useEvent(
      (event: CompositionEvent<HTMLInputElement>) => {
        canAutoSelectRef.current = true;
        composingRef.current = false;
        onCompositionEndProp?.(event);
        if (event.defaultPrevented) return;
        if (!autoSelect) return;
        forceValueUpdate();
      },
    );

    const onMouseDownProp = props.onMouseDown;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const showOnMouseDownProp = useBooleanEvent(showOnMouseDown);

    const onMouseDown = useEvent((event: MouseEvent<HTMLInputElement>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.button) return;
      if (event.ctrlKey) return;
      if (!store) return;
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
        if (event.ctrlKey) return;
        if (event.altKey) return;
        if (event.shiftKey) return;
        if (event.metaKey) return;
        if (!store) return;
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
      },
    );

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: ReactFocusEvent<HTMLInputElement>) => {
      // If we don't reset the canAutoSelectRef here, the combobox will keep the
      // first item selected when the combobox loses focus and its value gets
      // cleared. See combobox-cancel tests.
      canAutoSelectRef.current = false;
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
    });

    // This is necessary so other components like ComboboxCancel can reference
    // the combobox input in their aria-controls attribute. It's also used by
    // ComboboxLabel.
    const id = useId(props.id);

    const ariaAutoComplete = isAriaAutoCompleteValue(autoComplete)
      ? autoComplete
      : undefined;

    props = {
      id,
      role: "combobox",
      "aria-autocomplete": ariaAutoComplete,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "aria-expanded": open,
      "aria-controls": contentElement?.id,
      value,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onChange,
      onCompositionEnd,
      onMouseDown,
      onKeyDown,
      onBlur,
    };

    props = useComposite({
      store,
      focusable,
      ...props,
      // Enable inline autocomplete when the user moves from the combobox input
      // to an item.
      moveOnKeyPress: (event) => {
        if (isFalsyBooleanCallback(moveOnKeyPress, event)) return false;
        if (inline) setCanInline(true);
        return true;
      },
    });

    props = usePopoverAnchor({ store, ...props });

    return { autoComplete: "off", ...props };
  },
);

/**
 * Renders a combobox input.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
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
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * Whether the first item will be automatically selected when the combobox
   * input value changes. When it's set to `true`, the exact behavior will
   * depend on the value of
   * [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete) prop:
   * - If [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete)
   *   is `both` or `inline`, the first item is automatically focused when the
   *   popup opens, and the input value changes to reflect this. The inline
   *   completion string will be highlighted and will have a selected state.
   * - If [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete)
   *   is `list` or `none`, the first item is automatically focused when the
   *   popup opens, but the input value doesn't change.
   *
   * Live examples:
   * - [Combobox with integrated
   *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
   * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   * @default false
   */
  autoSelect?: boolean;
  /**
   * Whether the items will be filtered based on
   * [`value`](https://ariakit.org/reference/combobox-provider#value) and
   * whether the input value will temporarily change based on the active item.
   *
   * This prop is based on the standard
   * [`aria-autocomplete`](https://w3c.github.io/aria/#aria-autocomplete)
   * attribute, accepting the same values:
   * - `both`: indicates that the items will be filtered based on
   *   [`value`](https://ariakit.org/reference/combobox-provider#value) and the
   *   input value will temporarily change based on the active item. The
   *   filtering logic must be implemented by the consumer of this component,
   *   whereas Ariakit will automatically provide the inline autocompletion
   *   behavior.
   * - `list` (default): indicates that the items will be filtered based on
   *   [`value`](https://ariakit.org/reference/combobox-provider#value) and the
   *   input value will NOT change based on the active item. The filtering logic
   *   must be implemented by the consumer of this component.
   * - `inline`: indicates that the items are static, that is, they won't be
   *   filtered, but the input value will temporarily change based on the active
   *   item. Ariakit will automatically provide the inline autocompletion
   *   behavior
   * - `none`: the items are static and the input value will NOT change based on
   *   the active item.
   *
   * Live examples:
   * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
   * @default "list"
   */
  autoComplete?: StringWithValue<Required<AriaAttributes>["aria-autocomplete"]>;
  /**
   * Whether the combobox list/popover should be shown when the input value is
   * changed.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
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
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * @default true
   */
  setValueOnChange?: BooleanOrCallback<ChangeEvent<HTMLElement>>;
  /**
   * Whether the [`ComboboxList`](https://ariakit.org/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components should be shown when the input is clicked.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * @default true
   * @example
   * ```jsx
   * <Combobox showOnMouseDown={value.length > 1} />
   * ```
   */
  showOnMouseDown?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether the [`ComboboxList`](https://ariakit.org/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components should be shown when the user presses the arrow up or down keys
   * while focusing on the combobox input element.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * @default true
   * @example
   * ```jsx
   * <Combobox showOnKeyDown={value.length > 1} />
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
