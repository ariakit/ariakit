import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useEvent,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  getDocument,
  invariant,
  isFocusable,
  isSelfTarget,
} from "@ariakit/utils";
import type { ElementType, FocusEvent } from "react";
import { useContext, useMemo, useRef, useState } from "react";
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
  function useComboboxList({ store, alwaysVisible, ...props }) {
    const scopedContext = useComboboxScopedContext(true);
    const context = useComboboxContext();
    store = store || context;
    const scopedContextSameStore = !!store && store === scopedContext;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxList must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    // Virtual focus keeps DOM focus on the combobox input or select, so the
    // list itself must never hold it. Otherwise arrow keys stop working until
    // the user tabs back out.
    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      if (!isSelfTarget(event)) return;
      const compositeElement = store.getState().compositeElement;
      if (!compositeElement) return;
      // A modal popover may render the composite element inert, in which case
      // moving focus there would fight the dialog's focus containment.
      if (!isFocusable(compositeElement)) return;
      const list = event.currentTarget;
      queueMicrotask(() => {
        if (getDocument(list).activeElement !== list) return;
        compositeElement.focus();
      });
    });

    const ref = useRef<HTMLType>(null);
    const id = useId(props.id);
    const mounted = useStoreState(store, "mounted");
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: "none" } : props.style;

    const multiSelectable = useStoreState(store, ["selectedValue"], (state) =>
      Array.isArray(state.selectedValue),
    );

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

    // Heading hooks publish their id through DialogHeadingContext. Redirecting
    // that setter here makes the heading label this list, whose props take
    // precedence when it shares an element with ComboboxPopover.
    // ComboboxHeadingContext also exposes the id so nested lists can inherit it.
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
      onFocus,
      ref: useMergeRefs(setContentElement, ref, props.ref),
      style,
      // Keep DOM focus on the combobox control. Making the list a Tab stop
      // would cause its focus redirect to restart sequential navigation.
      tabIndex: -1,
    };

    return props;
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
  extends Options, Pick<DisclosureContentOptions<T>, "alwaysVisible"> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxListProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxListOptions<T>
>;
