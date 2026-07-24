import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useBooleanEvent,
  useEvent,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useTransactionState,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { isSelfTarget, invariant, removeUndefinedValues } from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, KeyboardEvent } from "react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  useCompositeProviderContext,
  useCompositeScopedContext,
} from "../composite/composite-context.tsx";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import { useCompositeTypeahead } from "../composite/composite-typeahead.tsx";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import { DialogHeadingContext } from "../dialog/dialog-context.tsx";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.tsx";
import { isHidden } from "../disclosure/disclosure-content.tsx";
import {
  ComboboxHeadingContext,
  ComboboxListRoleContext,
  ComboboxScopedContextProvider,
  useComboboxContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `ComboboxList` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxList({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxList = createHook<TagName, ComboboxListOptions>(
  function useComboboxList({
    store,
    alwaysVisible,
    resetOnEscape = true,
    hideOnEnter = true,
    composite,
    ...props
  }) {
    const scopedContext = useComboboxScopedContext(true);
    const scopedComposite = useCompositeScopedContext(true);
    const compositeProvider = useCompositeProviderContext();
    const context = useComboboxContext();
    store = store || context;
    const scopedContextSameStore = !!store && store === scopedContext;
    const inForeignScopedComposite =
      !!scopedComposite && scopedComposite !== store && !compositeProvider;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxList must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const ref = useRef<HTMLType>(null);
    const id = useId(props.id);
    const mounted = useStoreState(store, "mounted");
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: "none" } : props.style;

    const selectedValue = useStoreState(store, "selectedValue");
    const multiSelectable = Array.isArray(selectedValue);
    const [defaultSelectedValue, setDefaultSelectedValue] =
      useState(selectedValue);

    useEffect(() => {
      if (mounted) return;
      setDefaultSelectedValue(selectedValue);
    }, [mounted, selectedValue]);

    resetOnEscape = resetOnEscape && !multiSelectable;

    const onKeyDownProp = props.onKeyDown;
    const resetOnEscapeProp = useBooleanEvent(resetOnEscape);
    const hideOnEnterProp = useBooleanEvent(hideOnEnter);

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Escape" && resetOnEscapeProp(event)) {
        store?.setSelectedValue(defaultSelectedValue);
      }
      if (event.key === " " || event.key === "Enter") {
        if (isSelfTarget(event) && hideOnEnterProp(event)) {
          event.preventDefault();
          store?.hide();
        }
      }
    });

    const role = useAttribute(ref, "role", props.role);
    const isCompositeRole =
      role === "listbox" || role === "tree" || role === "grid";
    const ariaMultiSelectable = isCompositeRole
      ? multiSelectable || undefined
      : undefined;

    const [hasListboxInside, setHasListboxInside] = useState(false);
    const contentElement = useStoreState(store, "contentElement");
    const parentHeadingContext = useContext(ComboboxHeadingContext);
    const headingState = useState<string>();
    const [headingId, setHeadingId] = parentHeadingContext || headingState;
    const headingContext = useMemo<typeof headingState>(
      () => [headingId, setHeadingId],
      [headingId, setHeadingId],
    );
    const inputElement = useStoreState(store, "inputElement");
    const selectElement = useStoreState(store, "selectElement");
    composite =
      composite ??
      (!scopedContextSameStore &&
        !inForeignScopedComposite &&
        !inputElement &&
        !selectElement);

    // We support nested <ComboboxList> elements (usually in the form of
    // ComboboxPopover>ComboboxList), but we can't have nested listbox roles, so
    // we check here if there's already a listbox element inside the current
    // element.
    useSafeLayoutEffect(() => {
      if (!mounted) return;
      const element = ref.current;
      if (!element) return;
      if (contentElement !== element) return;
      const callback = () => {
        setHasListboxInside(!!element.querySelector("[role='listbox']"));
      };
      const observer = new MutationObserver(callback);
      observer.observe(element, {
        subtree: true,
        childList: true,
        attributeFilter: ["role"],
      });
      callback();
      return () => observer.disconnect();
    }, [mounted, contentElement]);

    if (!hasListboxInside) {
      props = {
        role: "listbox",
        "aria-multiselectable": ariaMultiSelectable,
        ...props,
      };
    }

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxScopedContextProvider value={store}>
          <ComboboxHeadingContext.Provider value={headingContext}>
            <DialogHeadingContext.Provider value={setHeadingId}>
              <ComboboxListRoleContext.Provider value={role}>
                {element}
              </ComboboxListRoleContext.Provider>
            </DialogHeadingContext.Provider>
          </ComboboxHeadingContext.Provider>
        </ComboboxScopedContextProvider>
      ),
      [store, role, headingContext],
    );

    // When nesting ComboboxList elements, the content element should be
    // assigned to the topmost ComboboxList element.
    const setContentElement =
      id && (!scopedContext || !scopedContextSameStore)
        ? store.setContentElement
        : null;
    const [, setListElement] = useTransactionState(
      composite ? store.setListElement : null,
    );

    const labelElement = useStoreState(
      store,
      ["labelElement", "selectLabelElement"],
      (state) => {
        if (headingId) return null;
        return state.selectLabelElement || state.labelElement;
      },
    );
    useAttribute(labelElement, "id");
    const labelId = headingId || labelElement?.id;

    props = {
      "aria-labelledby": props["aria-label"] != null ? undefined : labelId,
      hidden,
      ...props,
      id,
      ref: useMergeRefs(setContentElement, setListElement, ref, props.ref),
      style,
      onKeyDown,
    };

    props = useComposite({ store, ...props, composite });
    props = useCompositeTypeahead({
      store,
      typeahead: !inputElement,
      ...props,
    });

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a combobox list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid combobox popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`).
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxList>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxList>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxList = forwardRef(function ComboboxList(
  props: ComboboxListProps,
) {
  const htmlProps = useComboboxList(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxListOptions<T extends ElementType = TagName>
  extends
    Options,
    CompositeOptions<T>,
    CompositeTypeaheadOptions<T>,
    Pick<DisclosureContentOptions<T>, "alwaysVisible"> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * Whether the selected value should be reset when Escape is pressed.
   * @default true
   */
  resetOnEscape?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Whether the popover should hide when Enter or Space is pressed on the
   * list itself.
   * @default true
   */
  hideOnEnter?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
}

export type ComboboxListProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxListOptions<T>
>;
