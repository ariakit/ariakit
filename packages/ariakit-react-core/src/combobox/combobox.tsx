import {
  getPopupRole,
  getScrollingElement,
  getTextboxSelection,
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
  noop,
  normalizeString,
} from "@ariakit/core/utils/misc";
import { sync } from "@ariakit/core/utils/store";
import type {
  BooleanOrCallback,
  StringWithValue,
} from "@ariakit/core/utils/types";
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import type { PopoverAnchorOptions } from "../popover/popover-anchor.tsx";
import { usePopoverAnchor } from "../popover/popover-anchor.tsx";
import {
  useBooleanEvent,
  useEvent,
  useForceUpdate,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useUpdateEffect,
  useUpdateLayoutEffect,
} from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useComboboxProviderContext } from "./combobox-context.tsx";
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
    ...props
  }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Combobox must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const ref = useRef<HTMLType>(null);
    const [valueUpdated, forceValueUpdate] = useForceUpdate();
    const canAutoSelectRef = useRef(false);
    const composingRef = useRef(false);

    // We can only allow auto select when the combobox focus is handled via the
    // aria-activedescendant attribute. Othwerwise, the focus would move to the
    // first item on every keypress.
    const autoSelect = store.useState(
      (state) => state.virtualFocus && autoSelectProp,
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

    // Keep track of the previous selected values so we can set the
    // inlineActiveValue below only when the current activeValue isn't already
    // selected and isn't one of the previously selected values. See
    // tag-combobox test named "deselecting a tag should not highlight the input
    // text if it is not the first combobox item".
    const prevSelectedValueRef = useRef<ComboboxStoreSelectedValue>();
    useEffect(() => {
      return sync(store, ["selectedValue", "activeId"], (_, prev) => {
        prevSelectedValueRef.current = prev.selectedValue;
      });
    }, []);

    const inlineActiveValue = store.useState((state) => {
      if (!inline) return;
      if (!canInline) return;
      // It doesn't make sense to inline the active value if it's already
      // selected or just got deselected. Inlining the value typically implies
      // an addition, but if the value is already selected, the action actually
      // becomes a deletion. If the value was just deselected, pressing Enter
      // again would reselect it, but it's not the usual path, so we also take
      // into account the previously selected values. See tag-combobox test
      // named "deselecting a tag should not highlight the input text if it is
      // not the first combobox item".
      if (state.activeValue && Array.isArray(state.selectedValue)) {
        if (state.selectedValue.includes(state.activeValue)) return;
        if (prevSelectedValueRef.current?.includes(state.activeValue)) return;
      }
      return state.activeValue;
    });

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
        inlineActiveValue,
        autoSelect,
      );
      if (firstItemAutoSelected) {
        // If the first item is auto selected, we should append the completion
        // string to the end of the value. This will be highlited in the effect
        // below.
        if (hasCompletionString(storeValue, inlineActiveValue)) {
          const slice = inlineActiveValue?.slice(storeValue.length) || "";
          return storeValue + slice;
        }
        return storeValue;
      }
      return inlineActiveValue || storeValue;
    }, [inline, canInline, items, inlineActiveValue, autoSelect, storeValue]);

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
      const firstItemAutoSelected = isFirstItemAutoSelected(
        items,
        inlineActiveValue,
        autoSelect,
      );
      if (!firstItemAutoSelected) return;
      if (!hasCompletionString(storeValue, inlineActiveValue)) return;
      let cleanup = noop;
      // For some reason, this setSelectionRange may run before the value is
      // updated in the DOM. We're using a microtask to make sure it runs after
      // the value is updated so we don't lose the selection. See combobox-group
      // test-browser file.
      queueMicrotask(() => {
        const element = ref.current;
        if (!element) return;
        const { start: prevStart, end: prevEnd } = getTextboxSelection(element);
        const nextStart = storeValue.length;
        const nextEnd = inlineActiveValue.length;
        setSelectionRange(element, nextStart, nextEnd);
        cleanup = () => {
          // This effect may run after the value is updated and the completion
          // string is highlighted, for example, when the items are updated
          // asynchronously or in a React transition in a multi-selectable
          // combobox. In this case, we must restore the previous selection
          // range if it hasn't changed. TODO: Test this.
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
      items,
      autoSelect,
      storeValue,
    ]);

    const scrollingElementRef = useRef<Element | null>(null);
    const getAutoSelectIdProp = useEvent(getAutoSelectId);
    const autoSelectIdRef = useRef<string | null | undefined>(null);

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
        if (!canAutoSelectRef.current) return;
        // We won't disable the autoSelect behavior if the autoSelect item is
        // still focused.
        const { activeId } = store.getState();
        if (activeId === null) return;
        if (activeId === autoSelectIdRef.current) return;
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
      if (autoSelect !== "always" && open) return;
      canAutoSelectRef.current = open;
    }, [autoSelect, open]);

    const resetValueOnSelect = store.useState("resetValueOnSelect");

    // Auto select the first item on type. This effect runs both when the value
    // changes and when the items change so we also catch async items.
    useUpdateEffect(() => {
      const canAutoSelect = canAutoSelectRef.current;
      if (!store) return;
      if (!open) return;
      if ((!autoSelect || !canAutoSelect) && !resetValueOnSelect) return;
      const { baseElement, contentElement, activeId } = store.getState();
      if (baseElement && !hasFocus(baseElement)) return;
      // The data-placing attribute is an internal state added by the Popover
      // component. We can observe it to know when the popover is done placing
      // itself. This is to prevent the focus from moving to the first item
      // while the popover is still calculating its position, which could cause
      // a scroll jump. See combobox-group test-browser file.
      if (contentElement?.hasAttribute("data-placing")) {
        const observer = new MutationObserver(forceValueUpdate);
        observer.observe(contentElement, { attributeFilter: ["data-placing"] });
        return () => observer.disconnect();
      }
      if (autoSelect && canAutoSelect) {
        const userAutoSelectId = getAutoSelectIdProp(items);
        const autoSelectId =
          userAutoSelectId !== undefined
            ? userAutoSelectId
            : getDefaultAutoSelectId(items) ?? store.first();
        autoSelectIdRef.current = autoSelectId;
        // If there's no first item (that is, there are no items or all items
        // are disabled), we should move the focus to the input (null),
        // otherwise, with async items, the activeValue won't be reset. TODO:
        // Test this.
        store.move(autoSelectId ?? null);
      } else {
        const element = store.item(activeId)?.element;
        if (element && "scrollIntoView" in element) {
          element.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }
      return;
    }, [
      store,
      open,
      valueUpdated,
      storeValue,
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
          store?.setValue(value);
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
    }, [inline, contentElement, store, value]);

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
        const isSameValue = value === store.getState().value;
        store.setValue(value);
        // When the value is not set synchronously, the selection range may be
        // lost. See combobox-group "keep caret position when typing" test.
        queueMicrotask(() => {
          setSelectionRange(currentTarget, selectionStart, selectionEnd);
        });
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
    const onCompositionEnd = useEvent((event: CompositionEvent<HTMLType>) => {
      canAutoSelectRef.current = true;
      composingRef.current = false;
      onCompositionEndProp?.(event);
      if (event.defaultPrevented) return;
      if (!autoSelect) return;
      forceValueUpdate();
    });

    const onMouseDownProp = props.onMouseDown;
    const blurActiveItemOnClickProp = useBooleanEvent(
      blurActiveItemOnClick ?? (() => !!store?.getState().includesBaseElement),
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
        store.setValue(value);
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
        // Run combobox-tabs and combobox-group (browser) tests.
        canAutoSelectRef.current = false;
      }
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
      if (event.defaultPrevented) return;
    });

    // This is necessary so other components like ComboboxCancel can reference
    // the combobox input in their aria-controls attribute. It's also used by
    // ComboboxLabel.
    const id = useId(props.id);

    const ariaAutoComplete = isAriaAutoCompleteValue(autoComplete)
      ? autoComplete
      : undefined;

    const isActiveItem = store.useState((state) => state.activeId === null);

    props = {
      id,
      role: "combobox",
      "aria-autocomplete": ariaAutoComplete,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "aria-expanded": open,
      "aria-controls": contentElement?.id,
      "data-active-item": isActiveItem || undefined,
      value,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onChange,
      onCompositionEnd,
      onMouseDown,
      onKeyDown,
      onBlur,
    };

    props = useComposite<TagName>({
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

    props = usePopoverAnchor<TagName>({ store, ...props });

    return { autoComplete: "off", ...props };
  },
);

/**
 * Renders a combobox input element that can be used to filter a list of items.
 * @see https://ariakit.org/components/combobox
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

export interface ComboboxOptions<T extends ElementType = TagName>
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
   * Determines if the first enabled item will be automatically focused when the
   * combobox input value changes. If set to `true` or `"always"`, the exact
   * behavior hinges on the value of the
   * [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete) prop:
   * - If [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete)
   *   is `both` or `inline`, the first enabled item is automatically focused as
   *   the user types in the input. The value gets appended with the completion
   *   string if it matches. The inline completion string will be highlighted
   *   and selected.
   * - If [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete)
   *   is `list` or `none`, the first enabled item is automatically focused as
   *   the user types in the input, but the input value is not appended with the
   *   item value.
   *
   * If set to `"always"`, the first enabled item is auto-highlighted when the
   * combobox list opens, not just when the input value changes.
   *
   * To change which item gets auto-selected, use the
   * [`getAutoSelectId`](https://ariakit.org/reference/combobox#getautoselectid)
   * prop.
   *
   * Live examples:
   * - [Command Menu](https://ariakit.org/examples/dialog-combobox-command-menu)
   * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   * @default false
   */
  autoSelect?: boolean | "always";
  /**
   * Function that takes the currently rendered items and returns the id of the
   * item to be auto selected when the
   * [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop is
   * `true`.
   *
   * By default, the first enabled item is auto selected. This function is handy
   * if you prefer a different item to be auto selected.
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
   * [`value`](https://ariakit.org/reference/combobox-provider#value) and
   * whether the input value will temporarily change based on the active item.
   *
   * This prop is based on the standard
   * [`aria-autocomplete`](https://w3c.github.io/aria/#aria-autocomplete)
   * attribute, accepting the same values:
   * - `list` (default): indicates that the items will be dynamically rendered
   *   based on [`value`](https://ariakit.org/reference/combobox-provider#value)
   *   and the input value will _not_ change based on the active item. The
   *   filtering logic must be implemented by the consumer of this component.
   * - `inline`: indicates that the items are static, that is, they won't be
   *   filtered, but the input value will temporarily change based on the active
   *   item. Ariakit will automatically provide the inline autocompletion
   *   behavior.
   * - `both`: indicates that the items will be dynamically rendered based on
   *   [`value`](https://ariakit.org/reference/combobox-provider#value) and the
   *   input value will temporarily change based on the active item. The
   *   filtering logic must be implemented by the consumer of this component,
   *   whereas Ariakit will automatically provide the inline autocompletion
   *   behavior.
   * - `none`: the items are static and the input value will _not_ change based
   *   on the active item.
   *
   * Live examples:
   * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
   * @default "list"
   */
  autoComplete?: StringWithValue<Required<AriaAttributes>["aria-autocomplete"]>;
  /**
   * Determines if the highlighted item should lose focus when the user clicks
   * on the combobox input element. By default, this prop's value is set
   * according to the
   * [`includesBaseElement`](https://ariakit.org/reference/combobox-provider#includesbaseelement)
   * value.
   */
  blurActiveItemOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Specifies the minimum character count the input value should have before
   * the [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components are displayed.
   *
   * The [`showOnChange`](https://ariakit.org/reference/combobox#showonchange),
   * [`showOnClick`](https://ariakit.org/reference/combobox#showonclick), and
   * [`showOnKeyPress`](https://ariakit.org/reference/combobox#showonkeypress)
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
   * Whether the [`ComboboxList`](https://ariakit.org/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components should be shown when the input value changes.
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
   * Whether the [`ComboboxList`](https://ariakit.org/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components should be shown when the input is clicked.
   * @deprecated Use
   * [`showOnClick`](https://ariakit.org/reference/combobox#showonclick)
   * instead.
   * @default true
   */
  showOnMouseDown?: BooleanOrCallback<MouseEvent<HTMLElement>>;
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
   * <Combobox showOnClick={value.length > 1} />
   * ```
   */
  showOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether the [`ComboboxList`](https://ariakit.org/reference/combobox-list)
   * or [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components should be shown when the user presses the arrow up or down keys
   * while focusing on the combobox input element.
   * @deprecated Use
   * [`showOnKeyPress`](https://ariakit.org/reference/combobox#showonkeypress)
   * instead.
   * @default true
   */
  showOnKeyDown?: BooleanOrCallback<ReactKeyboardEvent<HTMLElement>>;
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
   * <Combobox showOnKeyPress={value.length > 1} />
   * ```
   */
  showOnKeyPress?: BooleanOrCallback<ReactKeyboardEvent<HTMLElement>>;
  /**
   * Whether the combobox
   * [`value`](https://ariakit.org/reference/combobox-provider#value) state
   * should be updated when the input value changes. This is useful if you want
   * to customize how the store
   * [`value`](https://ariakit.org/reference/combobox-provider#value) is updated
   * based on the input element's value.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * @default true
   */
  setValueOnChange?: BooleanOrCallback<ChangeEvent<HTMLElement>>;
  /**
   * Whether the combobox
   * [`value`](https://ariakit.org/reference/combobox-provider#value) state
   * should be updated when the combobox input element gets clicked. This
   * usually only applies when
   * [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete) is
   * `both` or `inline`, because the input value will temporarily change based
   * on the active item and the store
   * [`value`](https://ariakit.org/reference/combobox-provider#value) will not
   * be updated until the user confirms the selection.
   * @default true
   */
  setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}

export type ComboboxProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxOptions<T>
>;
