import { useStoreState } from "@ariakit/react-store";
import {
  useBooleanEvent,
  useEvent,
  useForceUpdate,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useTransactionState,
  useUpdateEffect,
  useUpdateLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { sync } from "@ariakit/store";
import {
  disabledFromProps,
  getPopupRole,
  getScrollingElement,
  getTextboxSelection,
  setSelectionRange,
  isFocusEventOutside,
  queueBeforeEvent,
  hasFocus,
  isInputEvent,
  invariant,
  isFalsyBooleanCallback,
  noop,
  normalizeString,
} from "@ariakit/utils";
import type { BooleanOrCallback, StringWithValue } from "@ariakit/utils";
import type {
  AriaAttributes,
  ChangeEvent,
  CompositionEvent,
  ElementType,
  MouseEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  SyntheticEvent,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import { getScrollItemIntoView } from "./__utils.ts";
import {
  useComboboxProviderContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import type {
  ComboboxStore,
  ComboboxStoreSelectedValue,
  ComboboxStoreState,
} from "./combobox-store.ts";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
  const normalizedValue = normalizeString(value);
  const normalizedActiveValue = normalizeString(activeValue);
  if (normalizedValue.length !== value.length) return false;
  if (normalizedActiveValue.length !== activeValue.length) return false;
  return (
    normalizedActiveValue.length > normalizedValue.length &&
    normalizedActiveValue
      .toLowerCase()
      .startsWith(normalizedValue.toLowerCase())
  );
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

function getDefaultAutoSelectId(items: ComboboxStoreState["items"]) {
  const item = items.find((item) => {
    if (item.disabled) return false;
    // When rendering tabs in a combobox widget, we ignore them and auto select
    // the first item that's not a tab instead.
    return item.element?.getAttribute("role") !== "tab";
  });
  return item?.id;
}

/**
 * Returns props to create a `Combobox` component.
 * @see https://ariakit.com/components/combobox
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
export const useCombobox = createHook<TagName, ComboboxOptions>(
  function useCombobox({
    store,
    focusable = true,
    autoSelect: autoSelectProp = false,
    getAutoSelectId,
    setValueOnChange,
    showMinLength = 0,
    showOnChange,
    showOnMouseDown,
    showOnClick = showOnMouseDown,
    showOnKeyDown,
    showOnKeyPress = showOnKeyDown,
    blurActiveItemOnClick,
    setValueOnClick = true,
    moveOnKeyPress = true,
    autoComplete = "list",
    name,
    form,
    disabled,
    ...props
  }) {
    const scopedContext = useComboboxScopedContext(true);
    const context = useComboboxProviderContext();
    store = store || context || scopedContext;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Combobox must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const ref = useRef<HTMLType>(null);
    const [valueUpdated, forceValueUpdate] = useForceUpdate();
    const canAutoSelectRef = useRef(false);
    const composingRef = useRef(false);
    const compositionEndFrameRef = useRef<number | null>(null);

    const cancelCompositionEndFrame = () => {
      const frame = compositionEndFrameRef.current;
      if (frame == null) return;
      cancelAnimationFrame(frame);
      compositionEndFrameRef.current = null;
    };

    // Auto-select requires virtual focus; otherwise every keypress would move
    // DOM focus to the first item.
    const autoSelect = useStoreState(
      store,
      ["virtualFocus"],
      (state) => state.virtualFocus && autoSelectProp,
    );

    const inline = autoComplete === "inline" || autoComplete === "both";
    // The inline autocomplete should only happen in certain circumstances. We
    // control this state here.
    const [canInline, setCanInline] = useState(inline);

    // TODO: Try deriving canInline instead of updating it in an effect.
    // Re-enable inline completion when the prop changes.
    useUpdateLayoutEffect(() => {
      if (!inline) return;
      setCanInline(true);
    }, [inline]);

    const storeInputValue = useStoreState(store, "inputValue");
    const selectedValue = useStoreState(store, ["selectedValue"], (state) => {
      if (!name) return;
      if (!Array.isArray(state.selectedValue)) return;
      return state.selectedValue;
    });
    const multiSelectable = Array.isArray(selectedValue);

    // Track deselected values so inline completion does not immediately offer
    // to add them again.
    const prevSelectedValueRef = useRef<ComboboxStoreSelectedValue>(undefined);
    useEffect(() => {
      return sync(store, ["selectedValue", "activeId"], (_, prev) => {
        prevSelectedValueRef.current = prev.selectedValue;
      });
    }, [store]);

    const inlineActiveValue = useStoreState(
      store,
      ["activeValue", "selectedValue", "activeId"],
      (state) => {
        if (!inline) return;
        if (!canInline) return;
        // Inline completion implies adding a value; skip values already
        // selected or just deselected so Enter does not invert the user's last
        // action.
        if (state.activeValue && Array.isArray(state.selectedValue)) {
          if (state.selectedValue.includes(state.activeValue)) return;
          if (prevSelectedValueRef.current?.includes(state.activeValue)) return;
        }
        return state.activeValue;
      },
    );

    const items = useStoreState(store, "renderedItems");
    const open = useStoreState(store, "open");
    const contentElement = useStoreState(store, "contentElement");
    const placing = useStoreState(store, "unstable_placing");
    // Depend on this boolean in the highlighting effect so equivalent item
    // updates don't re-highlight a user-adjusted caret.
    const firstItemAutoSelected = isFirstItemAutoSelected(
      items,
      inlineActiveValue,
      autoSelect,
    );

    // The current input value may differ from state.inputValue when
    // autoComplete is either "both" or "inline", in which case it will be
    // the active item value or a combination of the input value and the active
    // item value if it's the first item and it's been auto selected. This will
    // only affect the element's value, not the combobox state.
    const inputValue = useMemo(() => {
      if (!inline) return storeInputValue;
      if (!canInline) return storeInputValue;
      if (firstItemAutoSelected) {
        // If the first item is auto selected, we should append the completion
        // string to the end of the value. This will be highlited in the effect
        // below.
        if (hasCompletionString(storeInputValue, inlineActiveValue)) {
          const slice = inlineActiveValue?.slice(storeInputValue.length) || "";
          return storeInputValue + slice;
        }
        return storeInputValue;
      }
      return inlineActiveValue || storeInputValue;
    }, [
      inline,
      canInline,
      firstItemAutoSelected,
      inlineActiveValue,
      storeInputValue,
    ]);

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
      if (!inlineActiveValue) return;
      if (!firstItemAutoSelected) return;
      if (!hasCompletionString(storeInputValue, inlineActiveValue)) return;
      let cleanup = noop;
      // For some reason, this setSelectionRange may run before the value is
      // updated in the DOM. We're using a microtask to make sure it runs after
      // the value is updated so we don't lose the selection. See combobox-group
      // test-browser file.
      queueMicrotask(() => {
        const element = ref.current;
        if (!element) return;
        const { start: prevStart, end: prevEnd } = getTextboxSelection(element);
        const nextStart = storeInputValue.length;
        const nextEnd = inlineActiveValue.length;
        setSelectionRange(element, nextStart, nextEnd);
        cleanup = () => {
          // TODO: Add coverage for async item and transition updates.
          // Async item updates may rerun this after completion is highlighted.
          // Restore the previous range only if the selection is still ours.
          if (!hasFocus(element)) return;
          const { start, end } = getTextboxSelection(element);
          if (start !== nextStart) return;
          if (end !== nextEnd) return;
          setSelectionRange(element, prevStart, prevEnd);
        };
      });
      return () => cleanup();
    }, [
      valueUpdated,
      inline,
      canInline,
      inlineActiveValue,
      firstItemAutoSelected,
      storeInputValue,
    ]);

    const getAutoSelectIdProp = useEvent(getAutoSelectId);
    const autoSelectIdRef = useRef<string | null | undefined>(null);
    // Tracks the item (id and value) the autoSelect behavior last moved focus
    // to, so we can tell an already-focused item apart from one that only looks
    // the same, such as a different value under the same id (e.g. an index-keyed
    // list after filtering) or an item that became active without focus. This is
    // distinct from autoSelectIdRef above, which tracks the current target for
    // the scroll guard. Reset when the popover closes so reopening re-focuses.
    const autoSelectMovedRef = useRef<{
      id: string | null;
      value?: string;
    }>(undefined);
    const userScrolledRef = useRef(false);
    const isAutoScrollingRef = useRef(false);

    // Disable the autoSelect behavior when the user scrolls the combobox
    // content. This prevents the focus from moving to the first item on
    // virtualized and infinite lists.
    useEffect(() => {
      if (!open) return;
      if (!contentElement) return;
      const scrollingElement = getScrollingElement(contentElement);
      if (!scrollingElement) return;
      const onUserScroll = () => {
        // A wheel event is always initiated by the user, so we can disable the
        // autoSelect behavior without any additional checks.
        canAutoSelectRef.current = false;
        userScrolledRef.current = true;
      };
      const onScroll = () => {
        // Mark any non-programmatic scroll as user-initiated so we don't
        // reset the scroll position when new items load (e.g., infinite
        // scroll, scrollbar drag). Programmatic scrolls from scrollIntoView
        // set isAutoScrollingRef to avoid false positives.
        if (!isAutoScrollingRef.current) {
          userScrolledRef.current = true;
        }
        if (!store) return;
        if (!canAutoSelectRef.current) return;
        // We won't disable the autoSelect behavior if the autoSelect item is
        // still focused.
        const { activeId } = store.getState();
        if (activeId === null) return;
        if (activeId === autoSelectIdRef.current) return;
        canAutoSelectRef.current = false;
      };
      const options = { passive: true, capture: true };
      scrollingElement.addEventListener("wheel", onUserScroll, options);
      scrollingElement.addEventListener("touchmove", onUserScroll, options);
      scrollingElement.addEventListener("scroll", onScroll, options);
      return () => {
        scrollingElement.removeEventListener("wheel", onUserScroll, true);
        scrollingElement.removeEventListener("touchmove", onUserScroll, true);
        scrollingElement.removeEventListener("scroll", onScroll, true);
      };
    }, [open, contentElement, store]);

    // Reset the user-scrolled flag and set the changed flag to true whenever
    // the combobox value changes and is not empty. We're doing this here in
    // addition to in the onChange handler because the value may change
    // programmatically.
    useSafeLayoutEffect(() => {
      userScrolledRef.current = false;
      if (!storeInputValue) return;
      if (composingRef.current) return;
      canAutoSelectRef.current = true;
    }, [storeInputValue]);

    // Reset the changed flag when the popover is not open so we don't try to
    // auto select an item after the popover closes (for example, in the middle
    // of an animation).
    useSafeLayoutEffect(() => {
      if (autoSelect !== "always" && open) return;
      canAutoSelectRef.current = open;
    }, [autoSelect, open]);

    // Reset the auto-moved item when the popover closes so reopening re-focuses
    // the auto-selected item.
    useSafeLayoutEffect(() => {
      if (open) return;
      autoSelectMovedRef.current = undefined;
    }, [open]);

    const resetValueOnSelect = useStoreState(store, "resetValueOnSelect");

    // Auto select the first item on type. This effect runs both when the value
    // changes and when the items change so we also catch async items.
    useUpdateEffect(() => {
      const canAutoSelect = canAutoSelectRef.current;
      if (!store) return;
      if (!open) return;
      if (composingRef.current) return;
      if (!canAutoSelect && (!resetValueOnSelect || userScrolledRef.current))
        return;
      const state = store.getState();
      const { compositeElement, activeId, selectElement, selectedValue } =
        state;
      if (compositeElement && !hasFocus(compositeElement)) return;
      // Wait for the popover to finish placing itself before moving to an item,
      // so the move doesn't present an item inside a popup that is still at its
      // pre-placement origin. Read live, because the render snapshot in the
      // dependencies below still holds the previous commit's value on the
      // commit that opens the popup. See combobox-group test-browser file.
      if (state.unstable_placing) return;
      const activeValue = store.item(activeId)?.value;
      const activeValueSelected =
        activeValue != null &&
        (Array.isArray(selectedValue)
          ? selectedValue.includes(activeValue)
          : selectedValue === activeValue);
      const preserveSelectedValue =
        !!selectElement && !storeInputValue && activeValueSelected;
      if (autoSelect && canAutoSelect && !preserveSelectedValue) {
        const userAutoSelectId = getAutoSelectIdProp(items);
        const autoSelectId =
          userAutoSelectId !== undefined
            ? userAutoSelectId
            : (getDefaultAutoSelectId(items) ?? store.first());
        autoSelectIdRef.current = autoSelectId;
        // TODO: Add coverage for async items with no enabled result.
        // Move to the input when no enabled item exists so async results do not
        // retain a stale active value.
        const nextActiveId = autoSelectId ?? null;
        const nextActiveValue = store.item(nextActiveId)?.value;
        const moved = autoSelectMovedRef.current;
        // Move when the logical target changes, including a new value under the
        // same id, but never re-move the identical item: `move()` refocuses it
        // and can drop typed characters when virtualization resizes.
        // https://github.com/ariakit/ariakit/issues/3837
        if (
          nextActiveId !== activeId ||
          moved?.id !== nextActiveId ||
          moved?.value !== nextActiveValue
        ) {
          autoSelectMovedRef.current = {
            id: nextActiveId,
            value: nextActiveValue,
          };
          store.move(nextActiveId);
        } else {
          // The same item is already the focused active item, so we skip the
          // move to avoid re-focusing it. Keep activeValue in sync (a no-op
          // here since the value is unchanged) the way store.move() would.
          store.setState("activeValue", nextActiveValue);
        }
      } else {
        // Reset the scroll position to the active item when an item is selected
        // and the combobox value is reset, which might move the active item
        // offscreen. Otherwise, if no item is selected, reset to the first
        // item, such as when `autoSelect` is false.
        const element = store.item(activeId || store.first())?.element;
        if (element && "scrollIntoView" in element) {
          isAutoScrollingRef.current = true;
          element.scrollIntoView({ block: "nearest", inline: "nearest" });
          // Clear after the browser dispatches the scroll event. Scroll
          // events fire during the "scroll steps" of the rendering update,
          // which run before requestAnimationFrame callbacks.
          requestAnimationFrame(() => {
            isAutoScrollingRef.current = false;
          });
        }
      }
      return;
    }, [
      store,
      open,
      placing,
      valueUpdated,
      storeInputValue,
      autoSelect,
      resetValueOnSelect,
      getAutoSelectIdProp,
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
          store?.setInputValue(inputValue);
        }
      };
      for (const element of elements) {
        element.addEventListener("focusout", onBlur);
      }
      return () => {
        for (const element of elements) {
          element.removeEventListener("focusout", onBlur);
        }
      };
    }, [inline, contentElement, store, inputValue]);

    const canShow = (event: SyntheticEvent) => {
      const currentTarget = event.currentTarget as HTMLType;
      return currentTarget.value.length >= showMinLength;
    };

    const onChangeProp = props.onChange;
    const showOnChangeProp = useBooleanEvent(showOnChange ?? canShow);
    const setValueOnChangeProp = useBooleanEvent(
      // If the combobox is combined with tags, the value will be set by the tag
      // input component.
      setValueOnChange ?? !store.tag,
    );

    const onChange = useEvent((event: ChangeEvent<HTMLType>) => {
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      const currentTarget = event.currentTarget;
      const { value, selectionStart, selectionEnd } = currentTarget;
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
        const isSameValue = value === store.getState().inputValue;
        store.setInputValue(value);
        // When the value is not set synchronously, the selection range may be
        // lost. See combobox-group "keep caret position when typing" test.
        queueMicrotask(() => {
          setSelectionRange(currentTarget, selectionStart, selectionEnd);
        });
        if (inline && autoSelect && isSameValue) {
          // The DOM may contain inline completion even when typed text equals
          // store state. Re-render so the completion effect runs again.
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

    useEffect(() => cancelCompositionEndFrame, []);

    const onCompositionStartProp = props.onCompositionStart;

    const onCompositionStart = useEvent((event: CompositionEvent<HTMLType>) => {
      cancelCompositionEndFrame();
      canAutoSelectRef.current = false;
      composingRef.current = true;
      onCompositionStartProp?.(event);
    });

    const onCompositionEndProp = props.onCompositionEnd;

    // When dealing with composition text (for example, when the user is typing
    // in accents or chinese characters), we need to set canAutoSelectRef to
    // true when the composition ends. This is because the native input event
    // that's passed to the change event above will not produce a consistent
    // inputType value across browsers, so we can't rely on that there.
    const onCompositionEnd = useEvent((event: CompositionEvent<HTMLType>) => {
      canAutoSelectRef.current = true;
      composingRef.current = false;
      onCompositionEndProp?.(event);
      if (event.defaultPrevented) return;
      if (!autoSelect) return;
      cancelCompositionEndFrame();
      compositionEndFrameRef.current = requestAnimationFrame(() => {
        compositionEndFrameRef.current = null;
        if (composingRef.current) return;
        forceValueUpdate();
      });
    });

    const onMouseDownProp = props.onMouseDown;
    const blurActiveItemOnClickProp = useBooleanEvent(
      blurActiveItemOnClick ??
        (() => store.getState().compositeElementInFocusOrder),
    );
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const showOnClickProp = useBooleanEvent(showOnClick ?? canShow);

    const onMouseDown = useEvent((event: MouseEvent<HTMLType>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.button) return;
      if (event.ctrlKey) return;
      if (!store) return;
      if (blurActiveItemOnClickProp(event)) {
        store.setActiveId(null);
      }
      if (setValueOnClickProp(event)) {
        store.setInputValue(inputValue);
      }
      if (showOnClickProp(event)) {
        queueBeforeEvent(event.currentTarget, "mouseup", store.show);
      }
    });

    const onKeyDownProp = props.onKeyDown;
    const showOnKeyPressProp = useBooleanEvent(showOnKeyPress ?? canShow);

    const onKeyDown = useEvent((event: ReactKeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (!event.repeat) {
        canAutoSelectRef.current = false;
      }
      if (event.defaultPrevented) return;
      if (!store) return;
      const { open } = store.getState();
      // When the popover is open, prevent Enter (with or without modifiers)
      // from triggering the default behavior (submitting a parent form). If
      // there's an active item, the keyboard event proxy on Composite will
      // dispatch Enter to the item, which handles selection. If there's no
      // active item (e.g., all items are filtered out, or activeId is stale
      // after a React transition), Enter should be a no-op rather than
      // submitting a form.
      if (open && event.key === "Enter") {
        event.preventDefault();
        return;
      }
      if (event.ctrlKey) return;
      if (event.altKey) return;
      if (event.shiftKey) return;
      if (event.metaKey) return;
      if (open) return;
      // Up and Down arrow keys should open the combobox popover.
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (showOnKeyPressProp(event)) {
          event.preventDefault();
          store.show();
        }
      }
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: ReactFocusEvent<HTMLType>) => {
      // If we don't reset the canAutoSelectRef here, the combobox will keep the
      // first item selected when the combobox loses focus and its value gets
      // cleared. See combobox-cancel tests.
      canAutoSelectRef.current = false;
      onBlurProp?.(event);
    });

    // This is necessary so other components like ComboboxCancel can reference
    // the combobox input in their aria-controls attribute. It's also used by
    // ComboboxLabel.
    const id = useId(props.id);

    const ariaAutoComplete = isAriaAutoCompleteValue(autoComplete)
      ? autoComplete
      : undefined;

    const isActiveItem = useStoreState(
      store,
      ["activeId"],
      (state) => state.activeId === null,
    );

    const formDisabled = disabledFromProps({
      disabled,
      "aria-disabled": props["aria-disabled"],
    });

    const composite = props.composite !== false;
    const [, setCompositeElement] = useTransactionState(
      composite ? null : store.setCompositeElement,
    );
    const compositeElement = useStoreState(
      store,
      multiSelectable ? ["compositeElement"] : [],
      (state) => (multiSelectable ? state.compositeElement : null),
    );

    props = useWrapElement(
      props,
      (element) => {
        if (!name) return element;
        if (!Array.isArray(selectedValue)) return element;
        if (composite && !compositeElement) return element;
        return (
          <>
            {element}
            {selectedValue.map((value, index) => (
              <input
                key={index}
                type="hidden"
                name={name}
                form={form}
                disabled={formDisabled}
                value={value}
              />
            ))}
          </>
        );
      },
      [name, form, formDisabled, composite, compositeElement, selectedValue],
    );

    const htmlProps = {
      role: "combobox",
      "aria-autocomplete": ariaAutoComplete,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "aria-expanded": open,
      "aria-controls": contentElement?.id,
      "data-active-item": isActiveItem || undefined,
      value: inputValue,
      ...props,
      id,
      name: multiSelectable ? undefined : name,
      form,
      disabled,
      ref: useMergeRefs(
        ref,
        store.setInputElement,
        composite ? undefined : setCompositeElement,
        props.ref,
      ),
      onChange,
      onCompositionStart,
      onCompositionEnd,
      onMouseDown,
      onKeyDown,
      onBlur,
    };
    props = htmlProps;
    const scrollItemIntoView = getScrollItemIntoView(store);

    props = useComposite<TagName>({
      store,
      unstable_scrollIntoView: scrollItemIntoView,
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

    return { autoComplete: "off", ...props };
  },
);

/**
 * **Alias**: [`ComboboxInput`](https://ariakit.com/reference/combobox-input)
 *
 * Renders a combobox input element that can be used to filter a list of items.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {2}
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
export const Combobox = forwardRef(function Combobox(props: ComboboxProps) {
  const htmlProps = useCombobox(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxOptions<
  T extends ElementType = TagName,
> extends CompositeOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * Determines if the first enabled item will be automatically focused when the
   * combobox input value changes. If set to `true` or `"always"`, the exact
   * behavior hinges on the value of the
   * [`autoComplete`](https://ariakit.com/reference/combobox#autocomplete) prop:
   * - If [`autoComplete`](https://ariakit.com/reference/combobox#autocomplete)
   *   is `both` or `inline`, the first enabled item is automatically focused as
   *   the user types in the input. The value gets appended with the completion
   *   string if it matches. The inline completion string will be highlighted
   *   and selected.
   * - If [`autoComplete`](https://ariakit.com/reference/combobox#autocomplete)
   *   is `list` or `none`, the first enabled item is automatically focused as
   *   the user types in the input, but the input value is not appended with the
   *   item value.
   *
   * If set to `"always"`, the first enabled item is auto-highlighted when the
   * combobox list opens, not just when the input value changes.
   *
   * To change which item gets auto-selected, use the
   * [`getAutoSelectId`](https://ariakit.com/reference/combobox#getautoselectid)
   * prop.
   *
   * Live examples:
   * - [Command Menu with
   *   Tabs](https://ariakit.com/examples/dialog-combobox-tab-command-menu)
   * - [ComboboxGroup](https://ariakit.com/examples/combobox-group)
   * - [Combobox with links](https://ariakit.com/examples/combobox-links)
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * - [Menu with Combobox](https://ariakit.com/examples/menu-combobox)
   * - [Select with Combobox](https://ariakit.com/examples/select-combobox)
   * @default false
   */
  autoSelect?: boolean | "always";
  /**
   * Function that takes the currently rendered items and returns the id of the
   * item to be auto selected when the
   * [`autoSelect`](https://ariakit.com/reference/combobox#autoselect) prop is
   * `true`.
   *
   * By default, the first enabled item is auto selected. This function is handy
   * if you prefer a different item to be auto selected. Returning `undefined`
   * from this function will result in the default behavior.
   * @example
   * ```jsx
   * <Combobox
   *   autoSelect
   *   getAutoSelectId={(items) => {
   *     // Auto select the first enabled item with a value
   *     const item = items.find((item) => {
   *       if (item.disabled) return false;
   *       if (!item.value) return false;
   *       return true;
   *     });
   *     return item?.id;
   *   }}
   * />
   * ```
   */
  getAutoSelectId?: (
    renderedItems: ComboboxStoreState["renderedItems"],
  ) => string | null | undefined;
  /**
   * Whether the items will be filtered based on
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * and
   * whether the input value will temporarily change based on the active item.
   *
   * This prop is based on the standard
   * [`aria-autocomplete`](https://w3c.github.io/aria/#aria-autocomplete)
   * attribute, accepting the same values:
   * - `list` (default): indicates that the items will be dynamically rendered
   *   based on
   *   [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   *   and the input value will _not_ change based on the active item. The
   *   filtering logic must be implemented by the consumer of this component.
   * - `inline`: indicates that the items are static, that is, they won't be
   *   filtered, but the input value will temporarily change based on the active
   *   item. Ariakit will automatically provide the inline autocompletion
   *   behavior.
   * - `both`: indicates that the items will be dynamically rendered based on
   *   [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   *   and the
   *   input value will temporarily change based on the active item. The
   *   filtering logic must be implemented by the consumer of this component,
   *   whereas Ariakit will automatically provide the inline autocompletion
   *   behavior.
   * - `none`: the items are static and the input value will _not_ change based
   *   on the active item.
   *
   * Live examples:
   * - [ComboboxGroup](https://ariakit.com/examples/combobox-group)
   * @default "list"
   */
  autoComplete?: StringWithValue<Required<AriaAttributes>["aria-autocomplete"]>;
  /**
   * Determines if the highlighted item should lose focus when the user clicks
   * on the combobox input element. By default, this prop's value is set
   * according to the
   * [`compositeElementInFocusOrder`](https://ariakit.com/reference/combobox-provider#compositeelementinfocusorder)
   * value.
   */
  blurActiveItemOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Specifies the minimum character count the input value should have before
   * the [`ComboboxList`](https://ariakit.com/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * components are displayed.
   *
   * The [`showOnChange`](https://ariakit.com/reference/combobox#showonchange),
   * [`showOnClick`](https://ariakit.com/reference/combobox#showonclick), and
   * [`showOnKeyPress`](https://ariakit.com/reference/combobox#showonkeypress)
   * props allow you to tailor the behavior for each unique event.
   * @default 0
   * @example
   * In the following example, the combobox list will be shown when the input
   * value has at least one character. However, if the user presses the arrow
   * keys, the list will be shown regardless of the input value length.
   * ```jsx
   * <Combobox showMinLength={1} showOnKeyPress />
   * ```
   */
  showMinLength?: number;
  /**
   * Whether the [`ComboboxList`](https://ariakit.com/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * components should be shown when the input value changes.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * @default true
   * @example
   * ```jsx
   * <Combobox showOnChange={(event) => event.target.value.length > 1} />
   * ```
   */
  showOnChange?: BooleanOrCallback<ChangeEvent<HTMLElement>>;
  /**
   * Whether the [`ComboboxList`](https://ariakit.com/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * components should be shown when the input is clicked.
   * @deprecated Use
   * [`showOnClick`](https://ariakit.com/reference/combobox#showonclick)
   * instead.
   * @default true
   */
  showOnMouseDown?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether the [`ComboboxList`](https://ariakit.com/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * components should be shown when the input is clicked.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * @default true
   * @example
   * ```jsx
   * <Combobox showOnClick={value.length > 1} />
   * ```
   */
  showOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether the [`ComboboxList`](https://ariakit.com/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * components should be shown when the user presses the arrow up or down keys
   * while focusing on the combobox input element.
   * @deprecated Use
   * [`showOnKeyPress`](https://ariakit.com/reference/combobox#showonkeypress)
   * instead.
   * @default true
   */
  showOnKeyDown?: BooleanOrCallback<ReactKeyboardEvent<HTMLElement>>;
  /**
   * Whether the [`ComboboxList`](https://ariakit.com/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * components should be shown when the user presses the arrow up or down keys
   * while focusing on the combobox input element.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * @default true
   * @example
   * ```jsx
   * <Combobox showOnKeyPress={value.length > 1} />
   * ```
   */
  showOnKeyPress?: BooleanOrCallback<ReactKeyboardEvent<HTMLElement>>;
  /**
   * Whether the combobox
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * state
   * should be updated when the input value changes. This is useful if you want
   * to customize how the store
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * is updated
   * based on the input element's value.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * @default true
   */
  setValueOnChange?: BooleanOrCallback<ChangeEvent<HTMLElement>>;
  /**
   * Whether the combobox
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * state
   * should be updated when the combobox input element gets clicked. This
   * usually only applies when
   * [`autoComplete`](https://ariakit.com/reference/combobox#autocomplete) is
   * `both` or `inline`, because the input value will temporarily change based
   * on the active item and the store
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * will not be updated until the user confirms the selection.
   * @default true
   */
  setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}

export type ComboboxProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxOptions<T>
>;
